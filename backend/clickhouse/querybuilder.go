package clickhouse

import (
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
)

type Operator string

const (
	Is             Operator = "is"
	Contains       Operator = "contains"
	Exists         Operator = "exists"
	Between        Operator = "between"
	BetweenTime    Operator = "between_time"
	BetweenDate    Operator = "between_date"
	Matches        Operator = "matches"
	IsNot          Operator = "is_not"
	NotContains    Operator = "not_contains"
	NotExists      Operator = "not_exists"
	NotBetween     Operator = "not_between"
	NotBetweenTime Operator = "not_between_time"
	NotBetweenDate Operator = "not_between_date"
	NotMatches     Operator = "not_matches"
)

var negationMap map[Operator]Operator = map[Operator]Operator{
	IsNot:          Is,
	NotContains:    Contains,
	NotExists:      Exists,
	NotBetween:     Between,
	NotBetweenTime: BetweenTime,
	NotBetweenDate: BetweenDate,
	NotMatches:     Matches,
}

type Rule struct {
	Field string
	Op    Operator
	Val   []string
}

func deserializeRules(rules [][]string) ([]Rule, error) {
	ret := []Rule{}
	for _, r := range rules {
		if len(r) < 2 {
			return nil, fmt.Errorf("expecting >= 2 fields in rule %#v", r)
		}
		ret = append(ret, Rule{
			Field: r[0],
			Op:    Operator(r[1]),
			Val:   r[2:],
		})
	}
	return ret, nil
}

func parseSessionRule(admin *model.Admin, rule Rule, projectId int, start time.Time, end time.Time, sb *sqlbuilder.SelectBuilder) (string, error) {
	typ, _, found := strings.Cut(rule.Field, "_")
	if !found {
		return "", fmt.Errorf("separator not found for field %s", rule.Field)
	}
	if typ == "custom" {
		return parseColumnRule(admin, rule, projectId, sb)
	} else {
		return parseFieldRule(rule, projectId, start, end, sb)
	}
}

// parseFieldRule applies a filter using the `fields` table
func parseFieldRule(rule Rule, projectId int, start time.Time, end time.Time, sb *sqlbuilder.SelectBuilder) (string, error) {
	negatedOp, isNegative := negationMap[rule.Op]
	if isNegative {
		child, err := parseFieldRule(Rule{
			Field: rule.Field,
			Op:    negatedOp,
			Val:   rule.Val,
		}, projectId, start, end, sb)
		if err != nil {
			return "", err
		}
		return fmt.Sprintf("NOT %s", child), nil
	}

	typ, name, found := strings.Cut(rule.Field, "_")
	if !found {
		return "", fmt.Errorf("separator not found for field %s", rule.Field)
	}

	sbInner := sqlbuilder.NewSelectBuilder()
	sbInner.Select("SessionID").
		From("fields").
		Where(sbInner.Equal("ProjectID", projectId)).
		Where(sbInner.Equal("Type", typ)).
		Where(sbInner.Equal("Name", name)).
		Where(sbInner.Between("SessionCreatedAt", start, end))

	conditions := []string{}
	for _, v := range rule.Val {
		switch rule.Op {
		case Is:
			conditions = append(conditions, fmt.Sprintf("Value ILIKE %s", sbInner.Var(v)))
		case Contains:
			conditions = append(conditions, fmt.Sprintf("Value ILIKE %s", sbInner.Var("%"+v+"%")))
		case Matches:
			conditions = append(conditions, fmt.Sprintf("Value REGEXP %s", sbInner.Var(v)))
		case Exists:
			conditions = append(conditions, sbInner.IsNotNull("Value"))
		default:
			return "", fmt.Errorf("unsupported operator %s", rule.Op)
		}
	}

	sbInner.Where(sbInner.Or(conditions...))
	return sb.In("ID", sbInner), nil
}

type FieldType string

const (
	boolean    FieldType = "boolean"
	text       FieldType = "text"
	long       FieldType = "long"
	viewedByMe FieldType = "viewedByMe"
)

var customFieldTypes map[string]FieldType = map[string]FieldType{
	"viewed":          boolean,
	"viewed_by_me":    viewedByMe,
	"has_errors":      boolean,
	"has_rage_clicks": boolean,
	"processed":       boolean,
	"first_time":      boolean,
	"has_comments":    boolean,
	"app_version":     text,
	"active_length":   long,
	"pages_visited":   long,
}

// parseColumnRule applies a top-level column filter
func parseColumnRule(admin *model.Admin, rule Rule, projectId int, sb *sqlbuilder.SelectBuilder) (string, error) {
	negatedOp, isNegative := negationMap[rule.Op]
	if isNegative {
		child, err := parseColumnRule(admin, Rule{
			Field: rule.Field,
			Op:    negatedOp,
			Val:   rule.Val,
		}, projectId, sb)
		if err != nil {
			return "", err
		}
		return fmt.Sprintf("NOT %s", child), nil
	}

	_, name, found := strings.Cut(rule.Field, "_")
	if !found {
		return "", fmt.Errorf("separator not found for field %s", rule.Field)
	}

	customFieldType, found := customFieldTypes[name]
	if !found {
		customFieldType = text
	}

	mappedName, found := fieldMap[name]
	if !found {
		return "", fmt.Errorf("unknown column %s", name)
	}

	conditions := []string{}
	for _, v := range rule.Val {
		switch rule.Op {
		case Is:
			switch customFieldType {
			case text:
				conditions = append(conditions, fmt.Sprintf(`"%s" ILIKE %s`, mappedName, sb.Var(v)))
			case boolean:
				val, err := strconv.ParseBool(v)
				if err != nil {
					return "", err
				}
				conditions = append(conditions, sb.Equal(mappedName, val))
			case long:
				val, err := strconv.ParseInt(v, 10, 64)
				if err != nil {
					return "", err
				}
				conditions = append(conditions, sb.Equal(mappedName, val))
			case viewedByMe:
				// If no current admin, return false for the "viewed by me" filter
				if admin == nil {
					conditions = append(conditions, "FALSE")
				} else {
					switch v {
					case "true":
						conditions = append(conditions, fmt.Sprintf(`has("%s", %d)`, mappedName, admin.ID))
					case "false":
						conditions = append(conditions, fmt.Sprintf(`NOT has("%s", %d)`, mappedName, admin.ID))
					default:
						return "", fmt.Errorf("unsupported value for viewed_by_me: %s", v)
					}
				}
			default:
				return "", fmt.Errorf("unsupported custom field type %s", customFieldType)
			}
		case Contains:
			conditions = append(conditions, fmt.Sprintf(`"%s" ILIKE %s`, mappedName, sb.Var("%"+v+"%")))
		case Exists:
			conditions = append(conditions, sb.IsNotNull(mappedName))
		case Between:
			before, after, found := strings.Cut(v, "_")
			if !found {
				return "", fmt.Errorf("separator not found for between query %s", v)
			}
			start, err := strconv.ParseInt(before, 10, 64)
			if err != nil {
				return "", err
			}
			end, err := strconv.ParseInt(after, 10, 64)
			if err != nil {
				return "", err
			}
			conditions = append(conditions, sb.Between(mappedName, start, end))
		case BetweenTime:
			before, after, found := strings.Cut(v, "_")
			if !found {
				return "", fmt.Errorf("separator not found for between query %s", v)
			}
			start, err := strconv.ParseFloat(before, 64)
			if err != nil {
				return "", err
			}
			start *= 1000
			end, err := strconv.ParseFloat(after, 64)
			if err != nil {
				return "", err
			}
			end *= 1000
			// If the slider is at the maximum, allow any length length greater than the min
			if after == "60" {
				end = math.Inf(1)
			}
			conditions = append(conditions, sb.Between(mappedName, start, end))
		case BetweenDate:
			before, after, found := strings.Cut(v, "_")
			if !found {
				return "", fmt.Errorf("separator not found for between query %s", v)
			}
			startTime, err := time.Parse(timeFormat, before)
			if err != nil {
				return "", err
			}
			endTime, err := time.Parse(timeFormat, after)
			if err != nil {
				return "", err
			}
			conditions = append(conditions, sb.Between(mappedName, startTime, endTime))
		case Matches:
			conditions = append(conditions, fmt.Sprintf(`"%s" REGEXP %s`, sb.Var(mappedName), sb.Var(v)))
		default:
			return "", fmt.Errorf("unsupported operator %s", rule.Op)
		}
	}

	return sb.Or(conditions...), nil
}

func parseSessionRules(admin *model.Admin, isAnd bool, rules []Rule, projectId int, start time.Time, end time.Time, sb *sqlbuilder.SelectBuilder) (string, error) {
	if len(rules) == 0 {
		return "", errors.New("unexpected 0 rules")
	}

	joinFn := sb.And
	if !isAnd {
		joinFn = sb.Or
	}

	exprs := []string{}
	for _, r := range rules {
		str, err := parseSessionRule(admin, r, projectId, start, end, sb)
		if err != nil {
			return "", err
		}
		exprs = append(exprs, str)
	}

	return joinFn(exprs...), nil
}

func parseErrorRules(tableName string, selectColumns string, isAnd bool, rules []Rule, projectId int, start time.Time, end time.Time) (*sqlbuilder.SelectBuilder, error) {
	if len(rules) == 0 {
		return nil, errors.New("unexpected 0 rules")
	}

	groupRules := []Rule{}
	objectRules := []Rule{}
	for _, rule := range rules {
		typ, _, found := strings.Cut(rule.Field, "_")
		if !found {
			return nil, fmt.Errorf("separator not found for field %s", rule.Field)
		}

		if typ == "error" {
			groupRules = append(groupRules, rule)
		} else if typ == "error-field" {
			objectRules = append(objectRules, rule)
		} else {
			return nil, fmt.Errorf("invalid field type %s", typ)
		}
	}

	sb := sqlbuilder.NewSelectBuilder()
	joinFn := sb.And
	if !isAnd {
		joinFn = sb.Or
	}

	innerTableName := ErrorObjectsTable
	outerRules := groupRules
	innerRules := objectRules
	outerSelect := "ID"
	innerSelect := "ErrorGroupID"
	if tableName == ErrorObjectsTable {
		innerTableName = ErrorGroupsTable
		outerRules = objectRules
		innerRules = groupRules
		outerSelect = "ErrorGroupID"
		innerSelect = "ID"
	} else if tableName != ErrorGroupsTable {
		return nil, fmt.Errorf("invalid table name %s", tableName)
	}

	sb.Select(selectColumns).
		From(fmt.Sprintf("%s FINAL", tableName)).
		Where(sb.Equal("ProjectID", projectId))

	if tableName == ErrorObjectsTable {
		sb.Where(sb.Between("Timestamp", start, end))
	}

	if len(outerRules) > 0 {
		conditions := []string{}
		for _, rule := range outerRules {
			str, err := parseColumnRule(nil, rule, projectId, sb)
			if err != nil {
				return nil, err
			}
			conditions = append(conditions, str)
		}

		sb.Where(joinFn(conditions...))
	}

	if len(innerRules) > 0 {
		sbInner := sqlbuilder.NewSelectBuilder()
		sbInner.Select(innerSelect).
			From(fmt.Sprintf("%s FINAL", innerTableName)).
			Where(sbInner.Equal("ProjectID", projectId))

		if innerTableName == ErrorObjectsTable {
			sbInner.Where(sbInner.Between("Timestamp", start, end))
		}

		conditions := []string{}
		for _, rule := range innerRules {
			str, err := parseColumnRule(nil, rule, projectId, sbInner)
			if err != nil {
				return nil, err
			}
			conditions = append(conditions, str)
		}

		sbInner.Where(joinFn(conditions...))
		sb.Where(sb.In(outerSelect, sbInner))
	}

	return sb, nil
}

func getClickhouseHistogramSettings(options modelInputs.DateHistogramOptions) (string, string, *time.Location, error) {
	var aggFn string
	var addFn string
	switch options.BucketSize.CalendarInterval {
	case modelInputs.OpenSearchCalendarIntervalMinute:
		aggFn = "toRelativeMinuteNum"
		addFn = "addMinutes"
	case modelInputs.OpenSearchCalendarIntervalHour:
		aggFn = "toRelativeHourNum"
		addFn = "addHours"
	case modelInputs.OpenSearchCalendarIntervalDay:
		aggFn = "toRelativeDayNum"
		addFn = "addDays"
	case modelInputs.OpenSearchCalendarIntervalWeek:
		aggFn = "toRelativeWeekNum"
		addFn = "addWeeks"
	case modelInputs.OpenSearchCalendarIntervalMonth:
		aggFn = "toRelativeMonthNum"
		addFn = "addMonths"
	case modelInputs.OpenSearchCalendarIntervalQuarter:
		aggFn = "toRelativeQuarterNum"
		addFn = "addQuarters"
	case modelInputs.OpenSearchCalendarIntervalYear:
		aggFn = "toRelativeYearNum"
		addFn = "addYears"
	default:
		return "", "", nil, fmt.Errorf("invalid calendar interval: %s", options.BucketSize.CalendarInterval)
	}

	location, err := time.LoadLocation(options.TimeZone)
	if err != nil {
		return "", "", nil, err
	}

	return aggFn, addFn, location, nil
}
