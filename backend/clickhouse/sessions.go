package clickhouse

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
	"github.com/openlyinc/pointy"
	"github.com/samber/lo"
	"golang.org/x/sync/errgroup"
)

const timeFormat = "2006-01-02T15:04:05.000Z"

var fieldMap map[string]string = map[string]string{
	"fingerprint":     "Fingerprint",
	"pages_visited":   "PagesVisited",
	"viewed_by_me":    "ViewedByAdmins",
	"created_at":      "CreatedAt",
	"updated_at":      "UpdatedAt",
	"identified":      "Identified",
	"identifier":      "Identifier",
	"city":            "City",
	"country":         "Country",
	"os_name":         "OSName",
	"os_version":      "OSVersion",
	"browser_name":    "BrowserName",
	"browser_version": "BrowserVersion",
	"processed":       "Processed",
	"has_rage_clicks": "HasRageClicks",
	"has_errors":      "HasErrors",
	"length":          "Length",
	"active_length":   "ActiveLength",
	"environment":     "Environment",
	"app_version":     "AppVersion",
	"first_time":      "FirstTime",
	"viewed":          "Viewed",
}

type ClickhouseSession struct {
	ID                 int64
	Fingerprint        int32
	ProjectID          int32
	PagesVisited       int32
	ViewedByAdmins     clickhouse.ArraySet
	FieldKeys          clickhouse.ArraySet
	FieldKeyValues     clickhouse.ArraySet
	CreatedAt          time.Time
	UpdatedAt          time.Time
	SecureID           string
	Identified         bool
	Identifier         string
	IP                 string
	City               string
	Country            string
	OSName             string
	OSVersion          string
	BrowserName        string
	BrowserVersion     string
	Processed          *bool
	HasRageClicks      *bool
	HasErrors          *bool
	Length             int64
	ActiveLength       int64
	Environment        string
	AppVersion         *string
	FirstTime          *bool
	Viewed             *bool
	WithinBillingQuota *bool
	EventCounts        *string
	Excluded           bool
	Normalness         *float64
}

type ClickhouseField struct {
	ProjectID        int32
	Type             string
	Name             string
	SessionCreatedAt time.Time
	SessionID        int64
	Value            string
}

const SessionsTable = "sessions"
const FieldsTable = "fields"
const timeRangeField = "custom_created_at"

func (client *Client) WriteSessions(ctx context.Context, sessions []*model.Session) error {
	chFields := []interface{}{}
	chSessions := []interface{}{}

	for _, session := range sessions {
		if session == nil {
			return errors.New("nil session")
		}

		if session.Fields == nil {
			return fmt.Errorf("session.Fields is required for session %d", session.ID)
		}

		if session.ViewedByAdmins == nil {
			return fmt.Errorf("session.ViewedByAdmins is required for session %d", session.ID)
		}

		var fieldKeys clickhouse.ArraySet
		var fieldKeyValues clickhouse.ArraySet
		for _, field := range session.Fields {
			if field == nil {
				continue
			}
			fieldKeys = append(fieldKeys, field.Type+"_"+field.Name)
			fieldKeyValues = append(fieldKeyValues, field.Type+"_"+field.Name+"_"+field.Value)
			chf := ClickhouseField{
				ProjectID:        int32(session.ProjectID),
				Type:             field.Type,
				Name:             field.Name,
				Value:            field.Value,
				SessionID:        int64(session.ID),
				SessionCreatedAt: session.CreatedAt,
			}
			chFields = append(chFields, &chf)
		}

		var viewedByAdmins clickhouse.ArraySet
		for _, admin := range session.ViewedByAdmins {
			viewedByAdmins = append(viewedByAdmins, int32(admin.ID))
		}

		chs := ClickhouseSession{
			ID:                 int64(session.ID),
			Fingerprint:        int32(session.Fingerprint),
			ProjectID:          int32(session.ProjectID),
			PagesVisited:       int32(session.PagesVisited),
			ViewedByAdmins:     viewedByAdmins,
			FieldKeys:          fieldKeys,
			FieldKeyValues:     fieldKeyValues,
			CreatedAt:          session.CreatedAt,
			UpdatedAt:          session.UpdatedAt,
			SecureID:           session.SecureID,
			Identified:         session.Identified,
			Identifier:         session.Identifier,
			IP:                 session.IP,
			City:               session.City,
			Country:            session.Country,
			OSName:             session.OSName,
			OSVersion:          session.OSVersion,
			BrowserName:        session.BrowserName,
			BrowserVersion:     session.BrowserVersion,
			Processed:          session.Processed,
			HasRageClicks:      session.HasRageClicks,
			HasErrors:          session.HasErrors,
			Length:             session.Length,
			ActiveLength:       session.ActiveLength,
			Environment:        session.Environment,
			AppVersion:         session.AppVersion,
			FirstTime:          session.FirstTime,
			Viewed:             session.Viewed,
			WithinBillingQuota: session.WithinBillingQuota,
			EventCounts:        session.EventCounts,
			Excluded:           session.Excluded,
			Normalness:         session.Normalness,
		}

		chSessions = append(chSessions, &chs)
	}

	chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
		"async_insert":          1,
		"wait_for_async_insert": 1,
	}))

	var g errgroup.Group

	if len(chSessions) > 0 {
		sessionsSql, sessionsArgs := sqlbuilder.
			NewStruct(new(ClickhouseSession)).
			InsertInto(SessionsTable, chSessions...).
			BuildWithFlavor(sqlbuilder.ClickHouse)
		g.Go(func() error {
			return client.conn.Exec(chCtx, sessionsSql, sessionsArgs...)
		})
	}

	if len(chFields) > 0 {
		fieldsSql, fieldsArgs := sqlbuilder.
			NewStruct(new(ClickhouseField)).
			InsertInto(FieldsTable, chFields...).
			BuildWithFlavor(sqlbuilder.ClickHouse)

		g.Go(func() error {
			return client.conn.Exec(chCtx, fieldsSql, fieldsArgs...)
		})
	}

	return g.Wait()
}

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

type SingleRule struct {
	Field string
	Op    Operator
	Val   string
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
	if typ == "custom" {
		return parseSessionRule(admin, rule, projectId, sb)
	}
	return parseFieldRule(rule, projectId, start, end, sb)
}

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

func parseSessionRule(admin *model.Admin, rule Rule, projectId int, sb *sqlbuilder.SelectBuilder) (string, error) {
	negatedOp, isNegative := negationMap[rule.Op]
	if isNegative {
		child, err := parseSessionRule(admin, Rule{
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

func getSessionsQueryImpl(admin *model.Admin, query modelInputs.ClickhouseQuery, projectId int, retentionDate time.Time, selectColumns string, groupBy *string, orderBy *string, limit *int, offset *int) (string, []interface{}, error) {
	rules, err := deserializeRules(query.Rules)
	if err != nil {
		return "", nil, err
	}

	timeRangeRule, found := lo.Find(rules, func(r Rule) bool {
		return r.Field == timeRangeField
	})
	if !found {
		end := time.Now()
		start := end.AddDate(0, 0, -30)
		timeRangeRule = Rule{
			Field: timeRangeField,
			Op:    BetweenDate,
			Val:   []string{fmt.Sprintf("%s_%s", start.Format(timeFormat), end.Format(timeFormat))},
		}
		rules = append(rules, timeRangeRule)
	}
	if len(timeRangeRule.Val) != 1 {
		return "", nil, fmt.Errorf("unexpected length of time range value: %s", timeRangeRule.Val)
	}
	start, end, found := strings.Cut(timeRangeRule.Val[0], "_")
	if !found {
		return "", nil, fmt.Errorf("separator not found for time range: %s", timeRangeRule.Val[0])
	}
	startTime, err := time.Parse(timeFormat, start)
	if err != nil {
		return "", nil, err
	}
	endTime, err := time.Parse(timeFormat, end)
	if err != nil {
		return "", nil, err
	}

	sb := sqlbuilder.NewSelectBuilder()
	sb.Select(selectColumns).
		From("sessions FINAL").
		Where(sb.And(sb.Equal("ProjectID", projectId),
			"NOT Excluded",
			"WithinBillingQuota",
			sb.Or("NOT Processed",
				sb.GreaterEqualThan("ActiveLength", 1000),
				sb.And(sb.IsNull("ActiveLength"), sb.GreaterEqualThan("Length", 1000)))),
			sb.GreaterThan("CreatedAt", retentionDate),
		)

	conditions, err := parseGroup(admin, query.IsAnd, rules, projectId, startTime, endTime, sb)
	if err != nil {
		return "", nil, err
	}

	sb = sb.Where(conditions)
	if groupBy != nil {
		sb = sb.GroupBy(*groupBy)
	}
	if orderBy != nil {
		sb = sb.OrderBy(*orderBy)
	}
	if limit != nil {
		sb = sb.Limit(*limit)
	}
	if offset != nil {
		sb = sb.Offset(*offset)
	}

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	return sql, args, nil
}

func (client *Client) QuerySessionIds(ctx context.Context, admin *model.Admin, projectId int, count int, query modelInputs.ClickhouseQuery, sortField string, page *int, retentionDate time.Time) ([]int64, int64, error) {
	pageInt := 1
	if page != nil {
		pageInt = *page
	}
	offset := (pageInt - 1) * count

	sql, args, err := getSessionsQueryImpl(admin, query, projectId, retentionDate, "ID, count() OVER() AS total", nil, pointy.String(sortField), pointy.Int(count), pointy.Int(offset))
	if err != nil {
		return nil, 0, err
	}

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, 0, err
	}

	ids := []int64{}
	var total uint64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id, &total); err != nil {
			return nil, 0, err
		}
		ids = append(ids, id)
	}

	return ids, int64(total), nil
}

func (client *Client) QuerySessionHistogram(ctx context.Context, admin *model.Admin, projectId int, query modelInputs.ClickhouseQuery, retentionDate time.Time, options modelInputs.DateHistogramOptions) ([]time.Time, []int64, []int64, []int64, error) {
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
		return nil, nil, nil, nil, fmt.Errorf("invalid calendar interval: %s", options.BucketSize.CalendarInterval)
	}

	location, err := time.LoadLocation(options.TimeZone)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	selectCols := fmt.Sprintf("%s(CreatedAt, '%s') as time, count() as count, sum(if(HasErrors, 1, 0)) as has_errors", aggFn, location.String())

	orderBy := fmt.Sprintf("1 WITH FILL FROM %s(?, '%s') TO %s(?, '%s') STEP 1", aggFn, location.String(), aggFn, location.String())

	sql, args, err := getSessionsQueryImpl(admin, query, projectId, retentionDate, selectCols, pointy.String("1"), &orderBy, nil, nil)
	if err != nil {
		return nil, nil, nil, nil, err
	}
	args = append(args, *options.Bounds.StartDate, *options.Bounds.EndDate)
	sql = fmt.Sprintf("SELECT %s(makeDate(0, 0), time), count, has_errors from (%s)", addFn, sql)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, nil, nil, nil, err
	}

	bucketTimes := []time.Time{}
	totals := []int64{}
	withErrors := []int64{}
	withoutErrors := []int64{}
	for rows.Next() {
		var time time.Time
		var total uint64
		var withError uint64
		if err := rows.Scan(&time, &total, &withError); err != nil {
			return nil, nil, nil, nil, err
		}
		bucketTimes = append(bucketTimes, time)
		totals = append(totals, int64(total))
		withErrors = append(withErrors, int64(withError))
		withoutErrors = append(withoutErrors, int64(total-withError))
	}

	return bucketTimes, totals, withErrors, withoutErrors, nil
}

func (client *Client) QueryFieldNames(ctx context.Context, projectId int, start time.Time, end time.Time) ([]*model.Field, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sql, args := sb.
		Select("DISTINCT Type, Name").
		From("fields").
		Where(sb.And(
			sb.Equal("ProjectID", projectId),
			sb.Between("SessionCreatedAt", start, end))).
		BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	fields := []*model.Field{}
	for rows.Next() {
		var typ string
		var name string
		if err := rows.Scan(&typ, &name); err != nil {
			return nil, err
		}
		fields = append(fields, &model.Field{Type: typ, Name: name})
	}

	return fields, nil
}

func (client *Client) QueryFieldValues(ctx context.Context, projectId int, count int, fieldType string, fieldName string, query string, start time.Time, end time.Time) ([]string, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sql, args := sb.
		Select("Value").
		From("fields").
		Where(sb.And(
			sb.Equal("ProjectID", projectId),
			sb.Equal("Type", fieldType),
			sb.Equal("Name", fieldName),
			fmt.Sprintf("Value ILIKE %s", sb.Var("%"+query+"%")),
			sb.Between("SessionCreatedAt", start, end))).
		GroupBy("1").
		OrderBy("count() DESC").
		Limit(count).
		BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	values := []string{}
	for rows.Next() {
		var value string
		if err := rows.Scan(&value); err != nil {
			return nil, err
		}
		values = append(values, value)
	}

	return values, nil
}
