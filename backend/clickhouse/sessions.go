package clickhouse

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
	"github.com/samber/lo"
	"golang.org/x/sync/errgroup"
)

var fieldMap map[string]string = map[string]string{
	"fingerprint":      "Fingerprint",
	"pages_visited":    "PagesVisited",
	"viewed_by_admins": "ViewedByAdmins",
	"created_at":       "CreatedAt",
	"updated_at":       "UpdatedAt",
	"identified":       "Identified",
	"identifier":       "Identifier",
	"city":             "City",
	"country":          "Country",
	"os_name":          "OSName",
	"os_version":       "OSVersion",
	"browser_name":     "BrowserName",
	"browser_version":  "BrowserVersion",
	"processed":        "Processed",
	"has_rage_clicks":  "HasRageClicks",
	"has_errors":       "HasErrors",
	"length":           "Length",
	"active_length":    "ActiveLength",
	"environment":      "Environment",
	"app_version":      "AppVersion",
	"first_time":       "FirstTime",
	"viewed":           "Viewed",
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

func parseRule(rule Rule, projectId int, start string, end string) (string, error) {
	typ, _, found := strings.Cut(rule.Field, "_")
	if !found {
		return "", errors.New("separator not found for field")
	}
	if typ == "custom" {
		return parseSessionRule(rule, projectId)
	}
	return parseFieldRule(rule, projectId, start, end)
}

func parseFieldRule(rule Rule, projectId int, start string, end string) (string, error) {
	negatedOp, isNegative := negationMap[rule.Op]
	if isNegative {
		child, err := parseFieldRule(Rule{
			Field: rule.Field,
			Op:    negatedOp,
			Val:   rule.Val,
		}, projectId, start, end)
		if err != nil {
			return "", err
		}
		return fmt.Sprintf("NOT %s", child), nil
	}

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
			valueBuilder.WriteString(fmt.Sprintf("Value ILIKE '%s'", v))
		case Contains:
			valueBuilder.WriteString(fmt.Sprintf("Value ILIKE '%%%s%%'", v))
		case Matches:
			valueBuilder.WriteString(fmt.Sprintf("Value REGEXP '%s'", v))
		default:
			return "", errors.New("unsupported operator")
		}
		if idx == len(rule.Val)-1 {
			valueBuilder.WriteString(")")
		}
	}
	typ, name, found := strings.Cut(rule.Field, "_")
	if !found {
		return "", errors.New("separator not found for field")
	}

	return fmt.Sprintf(`ID IN (
		SELECT SessionID
		FROM fields
		WHERE ProjectID = %d
		AND Type = '%s' 
		AND Name = '%s'
		AND SessionCreatedAt BETWEEN parseDateTimeBestEffort('%s') AND parseDateTimeBestEffort('%s')
		%s
	)`, projectId, typ, name, start, end, valueBuilder.String()), nil
}

type FieldType string

const (
	boolean FieldType = "boolean"
	text    FieldType = "text"
	long    FieldType = "long"
)

var customFieldTypes map[string]FieldType = map[string]FieldType{
	"viewed":          boolean,
	"viewed_by_me":    boolean,
	"has_errors":      boolean,
	"has_rage_clicks": boolean,
	"processed":       boolean,
	"first_time":      boolean,
	"has_comments":    boolean,
	"app_version":     text,
	"active_length":   long,
	"pages_visited":   long,
}

func parseSessionRule(rule Rule, projectId int) (string, error) {
	negatedOp, isNegative := negationMap[rule.Op]
	if isNegative {
		child, err := parseSessionRule(Rule{
			Field: rule.Field,
			Op:    negatedOp,
			Val:   rule.Val,
		}, projectId)
		if err != nil {
			return "", err
		}
		return fmt.Sprintf("NOT %s", child), nil
	}

	_, name, found := strings.Cut(rule.Field, "_")
	if !found {
		return "", errors.New("separator not found for field")
	}

	customFieldType, found := customFieldTypes[name]
	if !found {
		customFieldType = text
	}

	chName, found := fieldMap[name]
	if found {
		name = chName
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
				valueBuilder.WriteString(fmt.Sprintf("%s ILIKE '%s'", name, v))
			case boolean:
				valueBuilder.WriteString(fmt.Sprintf("%s = %s", name, v))
			case long:
				valueBuilder.WriteString(fmt.Sprintf("%s = %s", name, v))
			default:
				return "", errors.New("unsupported custom field type")
			}
		case Contains:
			valueBuilder.WriteString(fmt.Sprintf("%s ILIKE '%%%s%%'", name, v))
		case Exists:
			valueBuilder.WriteString(fmt.Sprintf("%s IS NOT NULL", name))
		case Between:
			before, after, found := strings.Cut(v, "_")
			if !found {
				return "", errors.New("separator not found for between query")
			}
			valueBuilder.WriteString(fmt.Sprintf("%s BETWEEN '%s' AND '%s'", name, before, after))
		case BetweenTime:
			before, after, found := strings.Cut(v, "_")
			if !found {
				return "", errors.New("separator not found for between query")
			}
			valueBuilder.WriteString(fmt.Sprintf("%s BETWEEN '%s' AND '%s'", name, before, after))
		case BetweenDate:
			before, after, found := strings.Cut(v, "_")
			if !found {
				return "", errors.New("separator not found for between query")
			}
			valueBuilder.WriteString(fmt.Sprintf("%s BETWEEN parseDateTimeBestEffort('%s') AND parseDateTimeBestEffort('%s')", name, before, after))
		case Matches:
			valueBuilder.WriteString(fmt.Sprintf("%s REGEXP '%s'", name, v))
		default:
			return "", errors.New("unsupported operator")
		}
		if idx == len(rule.Val)-1 {
			valueBuilder.WriteString(")")
		}
	}

	return valueBuilder.String(), nil
}

func parseGroup(isAnd bool, rules []Rule, projectId int, start string, end string) (string, error) {
	if len(rules) == 0 {
		return "", errors.New("unexpected 0 rules")
	}

	separator := " AND "
	if !isAnd {
		separator = " OR "
	}

	var valueBuilder strings.Builder
	for idx, r := range rules {
		if idx > 0 {
			valueBuilder.WriteString(separator)
		}
		str, err := parseRule(r, projectId, start, end)
		if err != nil {
			return "", err
		}
		valueBuilder.WriteString(str)
	}

	return valueBuilder.String(), nil
}

func getClickhouseSessionsQuery(query modelInputs.ClickhouseQuery, projectId int, sortField string, limit int, offset int) (string, []interface{}, error) {
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
			Val:   []string{fmt.Sprintf("%s_%s", start.Format(time.RFC3339), end.Format(time.RFC3339))},
		}
		rules = append(rules, timeRangeRule)
	}
	if len(timeRangeRule.Val) != 1 {
		return "", nil, errors.New("unexpected length of time range value")
	}
	start, end, found := strings.Cut(timeRangeRule.Val[0], "_")
	if !found {
		return "", nil, errors.New("separator not found for time range")
	}

	conditions, err := parseGroup(query.IsAnd, rules, projectId, start, end)
	if err != nil {
		return "", nil, err
	}

	sb := sqlbuilder.NewSelectBuilder()
	sql, args := sb.Select("ID").From("sessions FINAL").
		Where(sb.And(sb.Equal("ProjectID", projectId),
			"NOT Excluded",
			"WithinBillingQuota",
			sb.Or(sb.GreaterEqualThan("ActiveLength", 1000), sb.And(sb.IsNull("ActiveLength"), sb.GreaterEqualThan("Length", 1000)))),
			conditions).
		OrderBy(sortField).
		Limit(limit).
		Offset(offset).
		BuildWithFlavor(sqlbuilder.ClickHouse)

	return sql, args, nil
}

func (client *Client) QuerySessionIds(ctx context.Context, projectId int, count int, query modelInputs.ClickhouseQuery, sortField string, page *int, retentionDate time.Time) ([]int64, error) {
	pageInt := 1
	if page != nil {
		pageInt = *page
	}
	offset := (pageInt - 1) * count

	sql, args, err := getClickhouseSessionsQuery(query, projectId, sortField, count, offset)
	if err != nil {
		return nil, err
	}

	rows, err := client.conn.Query(ctx, sql, args)
	if err != nil {
		return nil, err
	}

	ids := []int64{}
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}

	return ids, nil
}

func (client *Client) QueryFieldNames(ctx context.Context, projectId int, start time.Time, end time.Time) ([]*model.Field, error) {
	sql := fmt.Sprintf(`SELECT DISTINCT Type, Name
		FROM fields
		WHERE ProjectID = %d
		AND SessionCreatedAt BETWEEN parseDateTimeBestEffort('%s') AND parseDateTimeBestEffort('%s')`,
		projectId, start.Format(time.RFC3339), end.Format(time.RFC3339))

	rows, err := client.conn.Query(ctx, sql)
	if err != nil {
		return nil, err
	}

	fields := []*model.Field{}
	for rows.Next() {
		var field *model.Field
		if err := rows.Scan(&field); err != nil {
			return nil, err
		}
		fields = append(fields, field)
	}

	return fields, nil
}

func (client *Client) QueryFieldValues(ctx context.Context, projectId int, count int, fieldType string, fieldName string, query string, start time.Time, end time.Time) ([]string, error) {
	sql := fmt.Sprintf(`
		SELECT Value
		FROM fields
		WHERE ProjectID = %d
		AND Type = '%s'
		AND Name = '%s'
		AND Value ILIKE '%%%s%%'
		AND SessionCreatedAt BETWEEN parseDateTimeBestEffort('%s') AND parseDateTimeBestEffort('%s')
		GROUP BY 1
		ORDER BY count() DESC
		LIMIT %d`,
		projectId, fieldType, fieldName, query, start.Format(time.RFC3339), end.Format(time.RFC3339), count)

	rows, err := client.conn.Query(ctx, sql)
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
