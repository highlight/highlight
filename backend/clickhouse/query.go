package clickhouse

import (
	"context"
	"fmt"
	"reflect"
	"regexp"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/queryparser"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/huandu/go-sqlbuilder"
	"github.com/nqd/flat"
	"github.com/samber/lo"
)

const SamplingRows = 20_000_000
const KeysMaxRows = 1_000_000
const KeyValuesMaxRows = 1_000_000

type tableConfig[TReservedKey ~string] struct {
	tableName        string
	bodyColumn       string
	attributesColumn string
	keysToColumns    map[TReservedKey]string
	reservedKeys     []TReservedKey
	selectColumns    []string
	defaultFilters   map[string]string
}

func readObjects[TObj interface{}, TReservedKey ~string](ctx context.Context, client *Client, config tableConfig[TReservedKey], projectID int, params modelInputs.QueryInput, pagination Pagination, scanObject func(driver.Rows) (*Edge[TObj], error)) (*Connection[TObj], error) {
	sb := sqlbuilder.NewSelectBuilder()
	var err error
	var args []interface{}

	orderForward := OrderForwardNatural
	orderBackward := OrderBackwardNatural
	if pagination.Direction == modelInputs.SortDirectionAsc {
		orderForward = OrderForwardInverted
		orderBackward = OrderBackwardInverted
	}

	outerSelect := strings.Join(config.selectColumns, ", ")
	innerSelect := "Timestamp, UUID"

	if pagination.At != nil && len(*pagination.At) > 1 {
		// Create a "window" around the cursor
		// https://stackoverflow.com/a/71738696
		beforeSb, err := makeSelectBuilder(
			config,
			innerSelect,
			nil,
			projectID,
			params,
			Pagination{
				Before: pagination.At,
			},
			orderBackward,
			orderForward)
		if err != nil {
			return nil, err
		}
		beforeSb.Limit(LogsLimit/2 + 1)

		atSb, err := makeSelectBuilder(
			config,
			innerSelect,
			nil,
			projectID,
			params,
			Pagination{
				At: pagination.At,
			},
			orderBackward,
			orderForward)
		if err != nil {
			return nil, err
		}

		afterSb, err := makeSelectBuilder(
			config,
			innerSelect,
			nil,
			projectID,
			params,
			Pagination{
				After: pagination.At,
			},
			orderBackward,
			orderForward)
		if err != nil {
			return nil, err
		}
		afterSb.Limit(LogsLimit/2 + 1)

		ub := sqlbuilder.UnionAll(beforeSb, atSb, afterSb)
		sb.Select(outerSelect).
			From(config.tableName).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.In(fmt.Sprintf("(%s)", innerSelect), ub)).
			OrderBy(orderForward)
	} else {
		fromSb, err := makeSelectBuilder(
			config,
			innerSelect,
			nil,
			projectID,
			params,
			pagination,
			orderBackward,
			orderForward)
		if err != nil {
			return nil, err
		}

		fromSb.Limit(LogsLimit + 1)
		sb.Select(outerSelect).
			From(config.tableName).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.In(fmt.Sprintf("(%s)", innerSelect), fromSb)).
			OrderBy(orderForward)
	}

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := util.StartSpanFromContext(ctx, "logs", util.ResourceName("ReadLogs"))
	span.SetAttribute("Query", sql)
	span.SetAttribute("Params", params)

	rows, err := client.conn.Query(ctx, sql, args...)

	if err != nil {
		span.Finish(err)
		return nil, err
	}

	edges := []*Edge[TObj]{}

	for rows.Next() {
		edge, err := scanObject(rows)
		if err != nil {
			return nil, err
		}

		edges = append(edges, edge)
	}
	rows.Close()

	span.Finish(rows.Err())
	return getConnection(edges, pagination), nil
}

func makeSelectBuilder[T ~string](config tableConfig[T], selectStr string,
	groupBy []string, projectID int, params modelInputs.QueryInput, pagination Pagination, orderBackward string, orderForward string) (*sqlbuilder.SelectBuilder, error) {
	filters := makeFilters(params.Query, lo.Keys(config.keysToColumns), config.defaultFilters)
	sb := sqlbuilder.NewSelectBuilder()
	cols := []string{selectStr}
	for _, group := range groupBy {
		cols = append(cols, "toString(TraceAttributes["+sb.Var(group)+"])")
	}
	sb.Select(cols...)
	sb.From(config.tableName)

	// Clickhouse requires that PREWHERE clauses occur before WHERE clauses
	// sql-builder doesn't support PREWHERE natively so we use `SQL` which sets a marker
	// of where to place the raw SQL later when it is being built.
	// In this case, we are placing the marker after the `FROM` clause
	preWheres := []string{}
	bodyQuery := ""
	for _, body := range filters.body {
		if strings.Contains(body, "%") {
			bodyQuery = "Body ILIKE" + sb.Var(body)
		} else {
			preWheres = append(preWheres, "hasTokenCaseInsensitive(Body, "+sb.Var(body)+")")
		}
	}

	if len(preWheres) > 0 {
		sb.SQL("PREWHERE " + strings.Join(preWheres, " AND "))
	}
	if bodyQuery != "" {
		sb.Where(bodyQuery)
	}

	sb.Where(sb.Equal("ProjectId", projectID))

	if pagination.After != nil && len(*pagination.After) > 1 {
		timestamp, uuid, err := decodeCursor(*pagination.After)
		if err != nil {
			return nil, err
		}

		// See https://dba.stackexchange.com/a/206811
		sb.Where(sb.LessEqualThan("Timestamp", timestamp)).
			Where(sb.GreaterEqualThan("Timestamp", params.DateRange.StartDate)).
			Where(
				sb.Or(
					sb.LessThan("Timestamp", timestamp),
					sb.LessThan("UUID", uuid),
				),
			).OrderBy(orderForward)
	} else if pagination.At != nil && len(*pagination.At) > 1 {
		timestamp, uuid, err := decodeCursor(*pagination.At)
		if err != nil {
			return nil, err
		}
		sb.Where(sb.Equal("Timestamp", timestamp)).
			Where(sb.Equal("UUID", uuid))
	} else if pagination.Before != nil && len(*pagination.Before) > 1 {
		timestamp, uuid, err := decodeCursor(*pagination.Before)
		if err != nil {
			return nil, err
		}

		sb.Where(sb.GreaterEqualThan("Timestamp", timestamp)).
			Where(sb.LessEqualThan("Timestamp", params.DateRange.EndDate)).
			Where(
				sb.Or(
					sb.GreaterThan("Timestamp", timestamp),
					sb.GreaterThan("UUID", uuid),
				),
			).
			OrderBy(orderBackward)
	} else {
		sb.Where(sb.LessEqualThan("Timestamp", params.DateRange.EndDate)).
			Where(sb.GreaterEqualThan("Timestamp", params.DateRange.StartDate))

		if !pagination.CountOnly { // count queries can't be ordered because we don't include Timestamp in the select
			sb.OrderBy(orderForward)
		}
	}

	for key, column := range config.keysToColumns {
		makeFilterConditions(sb, filters.reserved[key], column)
	}

	conditions := []string{}
	for key, values := range filters.attributes {
		if len(values) == 1 {
			value := values[0]
			if strings.Contains(value, "%") {
				conditions = append(conditions, sb.Var(sqlbuilder.Buildf(config.attributesColumn+"[%s] LIKE %s", key, value)))
			} else if strings.HasPrefix(value, "!") {
				conditions = append(conditions, sb.Var(sqlbuilder.Buildf(config.attributesColumn+"[%s] != %s", key, value[1:])))
			} else {
				conditions = append(conditions, sb.Var(sqlbuilder.Buildf(config.attributesColumn+"[%s] = %s", key, value)))
			}
		} else {
			innerConditions := []string{}
			for _, value := range values {
				if strings.Contains(value, "%") {
					innerConditions = append(innerConditions, sb.Var(sqlbuilder.Buildf(config.attributesColumn+"[%s] LIKE %s", key, value)))
				} else if strings.HasPrefix(value, "!") {
					conditions = append(conditions, sb.Var(sqlbuilder.Buildf(config.attributesColumn+"[%s] != %s", key, value[1:])))
				} else {
					innerConditions = append(innerConditions, sb.Var(sqlbuilder.Buildf(config.attributesColumn+"[%s] = %s", key, value)))
				}
			}
			conditions = append(conditions, sb.Or(innerConditions...))
		}
	}
	if len(conditions) > 0 {
		sb.Where(sb.And(conditions...))
	}

	return sb, nil
}

type filtersWithReservedKeys[T ~string] struct {
	body       []string
	attributes map[string][]string
	reserved   map[T][]string
}

func makeFilters[T ~string](query string, reservedKeys []T, defaultFilters map[string]string) filtersWithReservedKeys[T] {
	filters := queryparser.Parse(query)
	filtersWithReservedKeys := filtersWithReservedKeys[T]{
		reserved:   make(map[T][]string),
		attributes: make(map[string][]string),
	}

	filtersWithReservedKeys.body = filters.Body

	for _, key := range reservedKeys {
		if val, ok := filters.Attributes[string(key)]; ok {
			filtersWithReservedKeys.reserved[key] = val
			delete(filters.Attributes, string(key))
		}
	}
	for key, value := range defaultFilters {
		if filters.Attributes[key] == nil {
			filters.Attributes[key] = []string{}
		}
		filters.Attributes[key] = append(filters.Attributes[key], value)
	}

	filtersWithReservedKeys.attributes = filters.Attributes

	return filtersWithReservedKeys
}

func makeFilterConditions(sb *sqlbuilder.SelectBuilder, filters []string, column string) {
	conditions := []string{}
	for _, filter := range filters {
		if strings.Contains(filter, "%") {
			conditions = append(conditions, sb.Like(column, filter))
		} else {
			conditions = append(conditions, sb.Equal(column, filter))
		}
	}

	if len(conditions) > 0 {
		sb.Where(sb.Or(conditions...))
	}
}

func expandJSON(logAttributes map[string]string) map[string]interface{} {
	gqlLogAttributes := make(map[string]interface{}, len(logAttributes))
	for i, v := range logAttributes {
		gqlLogAttributes[i] = v
	}

	out, err := flat.Unflatten(gqlLogAttributes, nil)
	if err != nil {
		return gqlLogAttributes
	}

	return out
}

func KeysAggregated(ctx context.Context, client *Client, tableName string, projectID int, startDate time.Time, endDate time.Time) ([]*modelInputs.QueryKey, error) {
	chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
		"max_rows_to_read": KeysMaxRows,
	}))

	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("Key, sum(Count)").
		From(tableName).
		Where(sb.Equal("ProjectId", projectID)).
		Where(fmt.Sprintf("Day >= toStartOfDay(%s)", sb.Var(startDate))).
		Where(fmt.Sprintf("Day <= toStartOfDay(%s)", sb.Var(endDate))).
		GroupBy("1").
		OrderBy("2 DESC, 1").
		Limit(500)

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := util.StartSpanFromContext(chCtx, "readKeys", util.ResourceName(tableName))
	span.SetAttribute("Query", sql)

	rows, err := client.conn.Query(chCtx, sql, args...)

	if err != nil {
		return nil, err
	}

	keys := []*modelInputs.QueryKey{}
	for rows.Next() {
		var (
			key   string
			count uint64
		)
		if err := rows.Scan(&key, &count); err != nil {
			return nil, err
		}

		keys = append(keys, &modelInputs.QueryKey{
			Name: key,
			Type: modelInputs.KeyTypeString, // For now, assume everything is a string
		})
	}

	rows.Close()

	span.Finish(rows.Err())
	return keys, rows.Err()
}

func KeyValuesAggregated(ctx context.Context, client *Client, tableName string, projectID int, keyName string, startDate time.Time, endDate time.Time) ([]string, error) {
	chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
		"max_rows_to_read": KeyValuesMaxRows,
	}))

	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("Value, sum(Count)").
		From(tableName).
		Where(sb.Equal("ProjectId", projectID)).
		Where(sb.Equal("Key", keyName)).
		Where(fmt.Sprintf("Day >= toStartOfDay(%s)", sb.Var(startDate))).
		Where(fmt.Sprintf("Day <= toStartOfDay(%s)", sb.Var(endDate))).
		GroupBy("1").
		OrderBy("2 DESC, 1").
		Limit(500)

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := util.StartSpanFromContext(chCtx, "readKeyValues", util.ResourceName(tableName))
	span.SetAttribute("Query", sql)

	rows, err := client.conn.Query(chCtx, sql, args...)
	if err != nil {
		return nil, err
	}

	values := []string{}
	for rows.Next() {
		var (
			value string
			count uint64
		)
		if err := rows.Scan(&value, &count); err != nil {
			return nil, err
		}

		values = append(values, value)
	}

	rows.Close()

	span.Finish(rows.Err())
	return values, rows.Err()
}

// clickhouse token - https://clickhouse.com/docs/en/sql-reference/functions/splitting-merging-functions#tokens
var nonAlphaNumericChars = regexp.MustCompile(`[^\w:*]`)

func matchesQuery[TObj interface{}, TReservedKey ~string](row *TObj, config tableConfig[TReservedKey], filters *queryparser.Filters) bool {
	v := reflect.ValueOf(*row)

	rowBodyTerms := map[string]bool{}
	if config.bodyColumn != "" && len(filters.Body) > 0 {
		body := v.FieldByName(config.bodyColumn).String()
		for _, field := range nonAlphaNumericChars.Split(body, -1) {
			if field != "" {
				rowBodyTerms[field] = true
			}
		}
		for _, body := range filters.Body {
			if strings.Contains(body, "%") {
				pat, err := regexp.Compile(strings.ReplaceAll(regexp.QuoteMeta(body), "%", ".*"))
				// this may over match if the expression cannot be compiled,
				// but we'd prefer to over match as this fn is used to determine sampling
				if err == nil {
					if !pat.MatchString(body) {
						return false
					}
				}
			} else if !rowBodyTerms[body] {
				return false
			}
		}
	}
	for key, values := range filters.Attributes {
		var rowValue string
		if chKey, ok := config.keysToColumns[TReservedKey(key)]; ok {
			if strings.Contains(chKey, ".") {
				var value = v
				for _, part := range strings.Split(chKey, ".") {
					value = value.FieldByName(part)
					if value.Kind() == reflect.Pointer {
						value = value.Elem()
					}
				}
				rowValue = value.String()
			} else {
				rowValue = v.FieldByName(chKey).String()
			}
		} else if config.attributesColumn != "" {
			value := v.FieldByName(config.attributesColumn)
			if value.Kind() == reflect.Map {
				rowValue = value.MapIndex(reflect.ValueOf(key)).String()
			} else if value.Kind() == reflect.Slice {
				// assume that the key is a 'field' in `type_name` format
				fieldParts := strings.SplitN(key, "_", 2)
				for i := 0; i < value.Len(); i++ {
					fieldType := value.Index(i).Elem().FieldByName("Type").String()
					name := value.Index(i).Elem().FieldByName("Name").String()
					if fieldType == fieldParts[0] && name == fieldParts[1] {
						rowValue = value.Index(i).Elem().FieldByName("Value").String()
						break
					}
				}
			}
		} else {
			continue
		}
		for _, v := range values {
			if strings.Contains(v, "%") {
				if matched, _ := regexp.Match(strings.ReplaceAll(v, "%", ".*"), []byte(rowValue)); !matched {
					return false
				}
			} else if v != rowValue {
				return false
			}

		}
	}
	return true
}
