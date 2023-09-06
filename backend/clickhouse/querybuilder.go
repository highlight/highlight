package clickhouse

import (
	"errors"
	"fmt"
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

func parseRule(admin *model.Admin, rule Rule, projectId int, start time.Time, end time.Time, sb *sqlbuilder.SelectBuilder) (string, error) {
	typ, _, found := strings.Cut(rule.Field, "_")
	if !found {
		return "", fmt.Errorf("separator not found for field %s", rule.Field)
	}
	if typ == "custom" || typ == "error" {
		return parseColumnRule(admin, rule, projectId, sb)
	} else if typ == "error-field" {
		return parseErrorFieldRule(rule, projectId, start, end, sb)
	} else {
		return parseFieldRule(rule, projectId, start, end, sb)
	}
}

// parseErrorFieldRule applies a filter using the `fields` table
func parseErrorFieldRule(rule Rule, projectId int, start time.Time, end time.Time, sb *sqlbuilder.SelectBuilder) (string, error) {
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

	_, name, found := strings.Cut(rule.Field, "_")
	if !found {
		return "", fmt.Errorf("separator not found for field %s", rule.Field)
	}

	mappedName, found := fieldMap[name]
	if !found {
		return "", fmt.Errorf("unknown column %s", name)
	}

	str := fmt.Sprintf(`ID IN (
		SELECT ErrorGroupID
		FROM error_objects
		WHERE ProjectID = %s
		AND Timestamp BETWEEN %s AND %s`,
		sb.Var(projectId),
		sb.Var(start),
		sb.Var(end))

	var valueBuilder strings.Builder
	for idx, v := range rule.Val {
		if idx == 0 {
			valueBuilder.WriteString("AND (")
		}
		if idx > 0 {
			valueBuilder.WriteString(" OR ")
		}
		switch rule.Op {
		case Is:
			valueBuilder.WriteString(fmt.Sprintf(`"%s" ILIKE %s`, mappedName, sb.Var(v)))
		case Contains:
			valueBuilder.WriteString(fmt.Sprintf(`"%s" ILIKE %s`, mappedName, sb.Var("%"+v+"%")))
		case Exists:
			valueBuilder.WriteString(sb.IsNotNull(mappedName))
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
			valueBuilder.WriteString(sb.Between(mappedName, startTime, endTime))
		case Matches:
			valueBuilder.WriteString(fmt.Sprintf(`"%s" REGEXP %s`, sb.Var(mappedName), sb.Var(v)))
		default:
			return "", fmt.Errorf("unsupported operator %s", rule.Op)
		}
		if idx == len(rule.Val)-1 {
			valueBuilder.WriteString(")")
		}
	}

	valueBuilder.WriteString(")")

	return str + valueBuilder.String(), nil
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

	str := fmt.Sprintf(`ID IN (
		SELECT SessionID
		FROM fields
		WHERE ProjectID = %s
		AND Type = %s
		AND Name = %s
		AND SessionCreatedAt BETWEEN %s AND %s`,
		sb.Var(projectId),
		sb.Var(typ),
		sb.Var(name),
		sb.Var(start),
		sb.Var(end))

	var valueBuilder strings.Builder
	for idx, v := range rule.Val {
		if idx == 0 {
			valueBuilder.WriteString("AND (")
		}
		if idx > 0 {
			valueBuilder.WriteString(" OR ")
		}
		switch rule.Op {
		case Is:
			valueBuilder.WriteString(fmt.Sprintf("Value ILIKE %s", sb.Var(v)))
		case Contains:
			valueBuilder.WriteString(fmt.Sprintf("Value ILIKE %s", sb.Var("%"+v+"%")))
		case Matches:
			valueBuilder.WriteString(fmt.Sprintf("Value REGEXP %s", sb.Var(v)))
		default:
			return "", fmt.Errorf("unsupported operator %s", rule.Op)
		}
		if idx == len(rule.Val)-1 {
			valueBuilder.WriteString(")")
		}
	}
	valueBuilder.WriteString(")")

	return str + valueBuilder.String(), nil
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

	var valueBuilder strings.Builder
	for idx, v := range rule.Val {
		if idx == 0 {
			valueBuilder.WriteString("(")
		}
		if idx > 0 {
			valueBuilder.WriteString(" OR ")
		}
		switch rule.Op {
		case Is:
			switch customFieldType {
			case text:
				valueBuilder.WriteString(fmt.Sprintf(`"%s" ILIKE %s`, mappedName, sb.Var(v)))
			case boolean:
				val, err := strconv.ParseBool(v)
				if err != nil {
					return "", err
				}
				valueBuilder.WriteString(sb.Equal(mappedName, val))
			case long:
				val, err := strconv.ParseInt(v, 10, 64)
				if err != nil {
					return "", err
				}
				valueBuilder.WriteString(sb.Equal(mappedName, val))
			case viewedByMe:
				switch v {
				case "true":
					valueBuilder.WriteString(fmt.Sprintf(`has("%s", %d)`, mappedName, admin.ID))
				case "false":
					valueBuilder.WriteString(fmt.Sprintf(`NOT has("%s", %d)`, mappedName, admin.ID))
				default:
					return "", fmt.Errorf("unsupported value for viewed_by_me: %s", v)
				}
			default:
				return "", fmt.Errorf("unsupported custom field type %s", customFieldType)
			}
		case Contains:
			valueBuilder.WriteString(fmt.Sprintf(`"%s" ILIKE %s`, mappedName, sb.Var("%"+v+"%")))
		case Exists:
			valueBuilder.WriteString(sb.IsNotNull(mappedName))
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
			valueBuilder.WriteString(sb.Between(mappedName, start, end))
		case BetweenTime:
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
			valueBuilder.WriteString(sb.Between(mappedName, start, end))
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
			valueBuilder.WriteString(sb.Between(mappedName, startTime, endTime))
		case Matches:
			valueBuilder.WriteString(fmt.Sprintf(`"%s" REGEXP %s`, sb.Var(mappedName), sb.Var(v)))
		default:
			return "", fmt.Errorf("unsupported operator %s", rule.Op)
		}
		if idx == len(rule.Val)-1 {
			valueBuilder.WriteString(")")
		}
	}

	return valueBuilder.String(), nil
}

func parseGroup(admin *model.Admin, isAnd bool, rules []Rule, projectId int, start time.Time, end time.Time, sb *sqlbuilder.SelectBuilder) (string, error) {
	if len(rules) == 0 {
		return "", errors.New("unexpected 0 rules")
	}

	joinFn := sb.And
	if !isAnd {
		joinFn = sb.Or
	}

	exprs := []string{}
	for _, r := range rules {
		str, err := parseRule(admin, r, projectId, start, end, sb)
		if err != nil {
			return "", err
		}
		exprs = append(exprs, str)
	}

	return joinFn(exprs...), nil
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
