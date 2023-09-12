package clickhouse

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/queryparser"
	"github.com/huandu/go-sqlbuilder"
	"github.com/nqd/flat"
	"github.com/samber/lo"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

type tableConfig[TReservedKey ~string] struct {
	tableName        string
	attributesColumn string
	keysToColumns    map[TReservedKey]string
	reservedKeys     []TReservedKey
	selectColumns    []string
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

	selectStr := strings.Join(config.selectColumns, ", ")

	if pagination.At != nil && len(*pagination.At) > 1 {
		// Create a "window" around the cursor
		// https://stackoverflow.com/a/71738696
		beforeSb, err := makeSelectBuilder(
			config,
			selectStr,
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
			selectStr,
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
			selectStr,
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
		sb.Select(selectStr).From(sb.BuilderAs(ub, "window")).OrderBy(orderForward)
	} else {
		fromSb, err := makeSelectBuilder(
			config,
			selectStr,
			projectID,
			params,
			pagination,
			orderBackward,
			orderForward)
		if err != nil {
			return nil, err
		}

		fromSb.Limit(LogsLimit + 1)
		sb.Select(selectStr).From(sb.BuilderAs(fromSb, "window")).OrderBy(orderForward)
	}

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := tracer.StartSpanFromContext(ctx, "logs", tracer.ResourceName("ReadLogs"))
	span.SetTag("Query", sql)
	span.SetTag("Params", params)

	rows, err := client.conn.Query(ctx, sql, args...)

	if err != nil {
		span.Finish(tracer.WithError(err))
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

	span.Finish(tracer.WithError(rows.Err()))
	return getConnection(edges, pagination), nil
}

func makeSelectBuilder[T ~string](config tableConfig[T], selectStr string, projectID int, params modelInputs.QueryInput, pagination Pagination, orderBackward string, orderForward string) (*sqlbuilder.SelectBuilder, error) {
	filters := makeFilters(params.Query, lo.Keys(config.keysToColumns))
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select(selectStr).From(config.tableName)

	// Clickhouse requires that PREWHERE clauses occur before WHERE clauses
	// sql-builder doesn't support PREWHERE natively so we use `SQL` which sets a marker
	// of where to place the raw SQL later when it is being built.
	// In this case, we are placing the marker after the `FROM` clause
	preWheres := []string{}
	for _, body := range filters.body {
		if strings.Contains(body, "%") {
			sb.Where("Body ILIKE" + sb.Var(body))
		} else {
			preWheres = append(preWheres, "hasTokenCaseInsensitive(Body, "+sb.Var(body)+")")
		}
	}

	if len(preWheres) > 0 {
		sb.SQL("PREWHERE " + strings.Join(preWheres, " AND "))
	}

	sb.Where(sb.Equal("ProjectId", projectID))

	if pagination.After != nil && len(*pagination.After) > 1 {
		timestamp, uuid, err := decodeCursor(*pagination.After)
		if err != nil {
			return nil, err
		}

		// See https://dba.stackexchange.com/a/206811
		sb.Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix()))).
			Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(params.DateRange.StartDate.Unix()))).
			Where(
				sb.Or(
					sb.LessThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix())),
					sb.LessThan("UUID", uuid),
				),
			).OrderBy(orderForward)
	} else if pagination.At != nil && len(*pagination.At) > 1 {
		timestamp, uuid, err := decodeCursor(*pagination.At)
		if err != nil {
			return nil, err
		}
		sb.Where(sb.Equal("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix()))).
			Where(sb.Equal("UUID", uuid))
	} else if pagination.Before != nil && len(*pagination.Before) > 1 {
		timestamp, uuid, err := decodeCursor(*pagination.Before)
		if err != nil {
			return nil, err
		}

		sb.Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix()))).
			Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(params.DateRange.EndDate.Unix()))).
			Where(
				sb.Or(
					sb.GreaterThan("toUInt64(toDateTime(Timestamp))", uint64(timestamp.Unix())),
					sb.GreaterThan("UUID", uuid),
				),
			).
			OrderBy(orderBackward)
	} else {
		sb.Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(params.DateRange.EndDate.Unix()))).
			Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(params.DateRange.StartDate.Unix())))

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
			} else {
				conditions = append(conditions, sb.Var(sqlbuilder.Buildf(config.attributesColumn+"[%s] = %s", key, value)))
			}
		} else {
			innerConditions := []string{}
			for _, value := range values {
				if strings.Contains(value, "%") {
					innerConditions = append(innerConditions, sb.Var(sqlbuilder.Buildf(config.attributesColumn+"[%s] LIKE %s", key, value)))
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

func makeFilters[T ~string](query string, reservedKeys []T) filtersWithReservedKeys[T] {
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

func Keys[T ~string](ctx context.Context, client *Client, config tableConfig[T], projectID int, startDate time.Time, endDate time.Time) ([]*modelInputs.QueryKey, error) {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select(fmt.Sprintf("arrayJoin(%s.keys) as key, count() as cnt", config.attributesColumn)).
		From(config.tableName).
		Where(sb.Equal("ProjectId", projectID)).
		GroupBy("key").
		OrderBy("cnt DESC").
		Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(endDate.Unix()))).
		Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(startDate.Unix())))

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := tracer.StartSpanFromContext(ctx, "tableName", tracer.ResourceName("Keys"))
	span.SetTag("Query", sql)

	rows, err := client.conn.Query(ctx, sql, args...)

	if err != nil {
		return nil, err
	}

	keys := []*modelInputs.QueryKey{}
	for rows.Next() {
		var (
			Key   string
			Count uint64
		)
		if err := rows.Scan(&Key, &Count); err != nil {
			return nil, err
		}

		keys = append(keys, &modelInputs.QueryKey{
			Name: Key,
			Type: modelInputs.KeyTypeString, // For now, assume everything is a string
		})
	}

	reservedKeys := config.reservedKeys
	for _, key := range reservedKeys {
		keys = append(keys, &modelInputs.QueryKey{
			Name: string(key),
			Type: modelInputs.KeyTypeString,
		})
	}

	rows.Close()

	span.Finish(tracer.WithError(rows.Err()))
	return keys, rows.Err()
}

func KeyValues[T ~string](ctx context.Context, client *Client, config tableConfig[T], projectID int, keyName string, startDate time.Time, endDate time.Time) ([]string, error) {
	sb := sqlbuilder.NewSelectBuilder()

	col := config.attributesColumn
	for key, c := range config.keysToColumns {
		if string(key) == keyName {
			col = c
			break
		}
	}

	if col == config.attributesColumn {
		sb.Select("DISTINCT " + col + " [" + sb.Var(keyName) + "] as value").
			From(config.tableName).
			Where(sb.Equal("ProjectId", projectID)).
			Where("mapContains(" + col + ", " + sb.Var(keyName) + ")").
			Limit(KeyValuesLimit)
	} else {
		sb.Select("DISTINCT " + col + " value").
			From(config.tableName).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.NotEqual("value", "")).
			Limit(KeyValuesLimit)
	}

	sb.Where(sb.LessEqualThan("toUInt64(toDateTime(Timestamp))", uint64(endDate.Unix()))).
		Where(sb.GreaterEqualThan("toUInt64(toDateTime(Timestamp))", uint64(startDate.Unix())))

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	rows, err := client.conn.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	values := []string{}
	for rows.Next() {
		var (
			Value string
		)
		if err := rows.Scan(&Value); err != nil {
			return nil, err
		}

		values = append(values, Value)
	}

	rows.Close()

	return values, rows.Err()
}
