package clickhouse

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/huandu/go-sqlbuilder"
	"github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
)

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
	ProjectID int32
	Type      string
	Name      string
	Value     string
	SessionID int64
}

const SessionsTable = "sessions"
const FieldsTable = "fields"

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
				ProjectID: int32(session.ProjectID),
				Type:      field.Type,
				Name:      field.Name,
				Value:     field.Value,
				SessionID: int64(session.ID),
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
			// client.conn.Stats()
		})
	}

	return g.Wait()
}

// type OpenSearchQuery = {
// 	query: any
// 	childQuery?: any
// }

// const getDefaultTimeRangeRule = (timeRangeField: SelectOption): RuleProps => {
// 	const presetOptions = getDefaultPresets()
// 	const defaultPreset = presetOptions[5]
// 	const period = {
// 		label: defaultPreset.label, // Start at 30 days
// 		value: `${defaultPreset.startDate.toISOString()}_${getNow().toISOString()}`, // Start at 30 days
// 	}
// 	return {
// 		field: timeRangeField,
// 		op: 'between_date',
// 		val: {
// 			kind: 'multi',
// 			options: [period],
// 		},
// 	}
// }

type Operator string

const (
	IsNot          Operator = "is_not"
	NotContains    Operator = "not_contains"
	NotExists      Operator = "not_exists"
	NotBetween     Operator = "not_between"
	NotBetweenTime Operator = "not_between_time"
	NotBetweenDate Operator = "not_between_date"
	NotMatches     Operator = "not_matches"
)

func isNegative(o Operator) bool {
	switch o {
	case IsNot:
	case NotContains:
	case NotExists:
	case NotBetween:
	case NotBetweenTime:
	case NotBetweenDate:
	case NotMatches:
		return true
	}
	return false
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
			return nil, errors.New("expecting >= 2")
		}
		ret = append(ret, Rule{
			Field: r[0],
			Op:    Operator(r[1]),
			Val:   r[2:],
		})
	}
	return ret, nil
}

func parseGroup(isAnd bool) {

}

func getSerializedQuery(sb *sqlbuilder.SelectBuilder, query modelInputs.ClickhouseQuery) *sqlbuilder.SelectBuilder {
	return nil
}

// const getSerializedQuery = (
// 	searchQuery: string,
// 	admin: Admin | undefined,
// 	customFields: CustomField[],
// 	timeRangeField: SelectOption,
// ): BackendSearchQuery => {
// 	const defaultTimeRangeRule = getDefaultTimeRangeRule(timeRangeField)

// 	const { isAnd, rules: serializedRules }: { isAnd: boolean; rules: any } =
// 		JSON.parse(searchQuery)
// 	const rules = deserializeRules(serializedRules)

// 	const parseGroup = (
// 		isAnd: boolean,
// 		rules: RuleProps[],
// 	): OpenSearchQuery => {
// 		const parseInner = (
// 			field: SelectOption,
// 			op: Operator,
// 			value?: string,
// 		): any => {
// 			const getCustomFieldOptions = (field: SelectOption | undefined) => {
// 				if (!field) {
// 					return undefined
// 				}

// 				const type = getType(field.value)
// 				if (
// 					![
// 						CUSTOM_TYPE,
// 						SESSION_TYPE,
// 						ERROR_TYPE,
// 						ERROR_FIELD_TYPE,
// 					].includes(type)
// 				) {
// 					return undefined
// 				}

// 				return customFields.find((f) => f.name === field.label)?.options
// 			}

// 			if (
// 				[CUSTOM_TYPE, ERROR_TYPE, ERROR_FIELD_TYPE].includes(
// 					getType(field.value),
// 				)
// 			) {
// 				const name = field.label
// 				const isKeyword = !(
// 					getCustomFieldOptions(field)?.type !== 'text'
// 				)

// 				if (field.label === 'viewed_by_me' && admin) {
// 					const baseQuery = {
// 						term: {
// 							[`viewed_by_admins.id`]: admin.id,
// 						},
// 					}

// 					if (value === 'true') {
// 						return {
// 							...baseQuery,
// 						}
// 					}
// 					return {
// 						bool: {
// 							must_not: {
// 								...baseQuery,
// 							},
// 						},
// 					}
// 				}

// 				switch (op) {
// 					case 'is':
// 						return {
// 							term: {
// 								[`${name}${isKeyword ? '.keyword' : ''}`]:
// 									value,
// 							},
// 						}
// 					case 'contains':
// 						return {
// 							wildcard: {
// 								[`${name}${
// 									isKeyword ? '.keyword' : ''
// 								}`]: `*${value}*`,
// 							},
// 						}
// 					case 'matches':
// 						return {
// 							regexp: {
// 								[`${name}${isKeyword ? '.keyword' : ''}`]:
// 									value,
// 							},
// 						}
// 					case 'exists':
// 						return { exists: { field: name } }
// 					case 'between_date':
// 						return {
// 							range: {
// 								[name]: {
// 									gte: getAbsoluteStartTime(value),
// 									lte: getAbsoluteEndTime(value),
// 								},
// 							},
// 						}
// 					case 'between_time':
// 						return {
// 							range: {
// 								[name]: {
// 									gte:
// 										Number(value?.split('_')[0]) *
// 										60 *
// 										1000,
// 									...(Number(value?.split('_')[1]) ===
// 									TIME_MAX_LENGTH
// 										? null
// 										: {
// 												lte:
// 													Number(
// 														value?.split('_')[1],
// 													) *
// 													60 *
// 													1000,
// 										  }),
// 								},
// 							},
// 						}
// 					case 'between':
// 						return {
// 							range: {
// 								[name]: {
// 									gte: Number(value?.split('_')[0]),
// 									...(Number(value?.split('_')[1]) ===
// 									RANGE_MAX_LENGTH
// 										? null
// 										: {
// 												lte: Number(
// 													value?.split('_')[1],
// 												),
// 										  }),
// 								},
// 							},
// 						}
// 				}
// 			} else {
// 				const key = field.value
// 				switch (op) {
// 					case 'is':
// 						return {
// 							term: {
// 								'fields.KeyValue': `${key}_${value}`,
// 							},
// 						}
// 					case 'contains':
// 						return {
// 							wildcard: {
// 								'fields.KeyValue': `${key}_*${value}*`,
// 							},
// 						}
// 					case 'matches':
// 						return {
// 							regexp: {
// 								'fields.KeyValue': `${key}_${value}`,
// 							},
// 						}
// 					case 'exists':
// 						return { term: { 'fields.Key': key } }
// 				}
// 			}
// 		}

// 		const NEGATION_MAP: { [K in Operator]: Operator } = {
// 			is: 'is_not',
// 			is_not: 'is',
// 			contains: 'not_contains',
// 			not_contains: 'contains',
// 			exists: 'not_exists',
// 			not_exists: 'exists',
// 			between: 'not_between',
// 			not_between: 'between',
// 			between_time: 'not_between_time',
// 			not_between_time: 'between_time',
// 			between_date: 'not_between_date',
// 			not_between_date: 'between_date',
// 			matches: 'not_matches',
// 			not_matches: 'matches',
// 		}

// 		const parseRuleImpl = (
// 			field: SelectOption,
// 			op: Operator,
// 			multiValue: MultiselectOption,
// 		): any => {
// 			if (isNegative(op)) {
// 				return {
// 					bool: {
// 						must_not: {
// 							...parseRuleImpl(
// 								field,
// 								NEGATION_MAP[op],
// 								multiValue,
// 							),
// 						},
// 					},
// 				}
// 			} else if (hasArguments(op)) {
// 				return {
// 					bool: {
// 						should: multiValue.options.map(({ value }) =>
// 							parseInner(field, op, value),
// 						),
// 					},
// 				}
// 			} else {
// 				return parseInner(field, op)
// 			}
// 		}

// 		const parseRule = (rule: RuleProps): any => {
// 			const field = rule.field!
// 			const multiValue = rule.val!
// 			const op = rule.op!

// 			return parseRuleImpl(field, op, multiValue)
// 		}

// 		const condition = isAnd ? 'must' : 'should'
// 		const filterErrors = rules.some(
// 			(r) => getType(r.field!.value) === ERROR_FIELD_TYPE,
// 		)
// 		const timeRange =
// 			rules.find(
// 				(rule) =>
// 					rule.field?.value === defaultTimeRangeRule.field!.value,
// 			) ?? defaultTimeRangeRule

// 		const timeRule = parseRule(timeRange)

// 		const errorObjectRules = rules
// 			.filter(
// 				(r) =>
// 					getType(r.field!.value) === ERROR_FIELD_TYPE &&
// 					r !== timeRange,
// 			)
// 			.map(parseRule)

// 		const standardRules = rules
// 			.filter(
// 				(r) =>
// 					getType(r.field!.value) !== ERROR_FIELD_TYPE &&
// 					r !== timeRange,
// 			)
// 			.map(parseRule)

// 		const request: OpenSearchQuery = { query: {} }

// 		if (filterErrors) {
// 			const errorGroupFilter = {
// 				bool: {
// 					[condition]: standardRules,
// 				},
// 			}
// 			const errorObjectFilter = {
// 				bool: {
// 					must: [
// 						timeRule,
// 						{
// 							bool: {
// 								[condition]: errorObjectRules,
// 							},
// 						},
// 					],
// 				},
// 			}
// 			request.query = {
// 				bool: {
// 					must: [
// 						errorGroupFilter,
// 						{
// 							has_child: {
// 								type: 'child',
// 								query: errorObjectFilter,
// 							},
// 						},
// 					],
// 				},
// 			}
// 			request.childQuery = {
// 				bool: {
// 					must: [
// 						{
// 							has_parent: {
// 								parent_type: 'parent',
// 								query: errorGroupFilter,
// 							},
// 						},
// 						errorObjectFilter,
// 					],
// 				},
// 			}
// 		} else {
// 			request.query = {
// 				bool: {
// 					must: [
// 						timeRule,
// 						{
// 							bool: {
// 								[condition]: standardRules,
// 							},
// 						},
// 					],
// 				},
// 			}
// 		}
// 		return request
// 	}

// 	const timeRange =
// 		rules.find(
// 			(rule) => rule.field?.value === defaultTimeRangeRule.field!.value,
// 		) ?? defaultTimeRangeRule

// 	const startDate = roundFeedDate(
// 		getAbsoluteStartTime(timeRange.val?.options[0].value),
// 	)
// 	const endDate = roundFeedDate(
// 		getAbsoluteEndTime(timeRange.val?.options[0].value),
// 	)
// 	const backendSearchQuery = parseGroup(isAnd, rules)
// 	return {
// 		searchQuery: JSON.stringify(backendSearchQuery.query),
// 		childSearchQuery: backendSearchQuery.childQuery
// 			? JSON.stringify(backendSearchQuery.childQuery)
// 			: undefined,
// 		startDate,
// 		endDate,
// 		histogramBucketSize: GetHistogramBucketSize(
// 			moment.duration(endDate.diff(startDate)),
// 		),
// 	}
// }

func (client *Client) QuerySessionIds(ctx context.Context, projectId int, count int, query modelInputs.ClickhouseQuery, sortField *string, sortDesc bool, page *int, retentionDate time.Time) ([]int64, error) {
	sortFieldStr := "CreatedAt"
	if sortField != nil {
		sortFieldStr = *sortField
	}

	sortOrder := "desc"
	if !sortDesc {
		sortOrder = "asc"
	}

	pageInt := 1
	if page != nil {
		pageInt = *page
	}
	offset := (pageInt - 1) * count

	logrus.WithContext(ctx).Info(query)

	// s.backendSearchQuery = getSerializedQuery(
	// 	s.searchQuery,
	// 	action.admin,
	// 	action.customFields,
	// 	action.timeRangeField,
	// )

	sb := sqlbuilder.NewSelectBuilder()
	sql, args := sb.Select("ID").
		From(fmt.Sprintf("%s FINAL", SessionsTable)).
		Where(sb.Equal("ProjectID", projectId)).
		Where(sb.GreaterEqualThan("CreatedAt", retentionDate)).
		OrderBy(fmt.Sprintf("%s %s", sortFieldStr, sortOrder)).
		Limit(count).
		Offset(offset).
		BuildWithFlavor(sqlbuilder.ClickHouse)

	logrus.WithContext(ctx).Info(sql)

	rows, err := client.conn.Query(ctx, sql, args...)
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
