package clickhouse

import (
	"context"
	"errors"
	"fmt"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/parser"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/queryparser"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/huandu/go-sqlbuilder"
	"github.com/nqd/flat"
	"github.com/samber/lo"
)

const SamplingRows = 20_000_000
const KeysMaxRows = 1_000_000
const KeyValuesMaxRows = 1_000_000

type sampleableTableConfig[TReservedKey ~string] struct {
	tableConfig         model.TableConfig[TReservedKey]
	samplingTableConfig model.TableConfig[TReservedKey]
	useSampling         func(time.Duration) bool
}

func readObjects[TObj interface{}, TReservedKey ~string](ctx context.Context, client *Client, config model.TableConfig[TReservedKey], projectID int, params modelInputs.QueryInput, pagination Pagination, scanObject func(driver.Rows) (*Edge[TObj], error)) (*Connection[TObj], error) {
	sb := sqlbuilder.NewSelectBuilder()
	var err error
	var args []interface{}

	orderForward := OrderForwardNatural
	orderBackward := OrderBackwardNatural
	if pagination.Direction == modelInputs.SortDirectionAsc {
		orderForward = OrderForwardInverted
		orderBackward = OrderBackwardInverted
	}

	outerSelect := strings.Join(config.SelectColumns, ", ")
	innerSelect := "Timestamp, UUID"
	if pagination.At != nil && len(*pagination.At) > 1 {
		// Create a "window" around the cursor
		// https://stackoverflow.com/a/71738696
		beforeSb, err := makeSelectBuilder(
			config,
			innerSelect,
			nil,
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
		beforeSb.Distinct().Limit(LogsLimit/2 + 1)

		atSb, err := makeSelectBuilder(
			config,
			innerSelect,
			nil,
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
		atSb.Distinct()

		afterSb, err := makeSelectBuilder(
			config,
			innerSelect,
			nil,
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
		afterSb.Distinct().Limit(LogsLimit/2 + 1)

		ub := sqlbuilder.UnionAll(beforeSb, atSb, afterSb)
		sb.Select(outerSelect).
			Distinct().
			From(config.TableName).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.In(fmt.Sprintf("(%s)", innerSelect), ub)).
			OrderBy(orderForward)
	} else {
		fromSb, err := makeSelectBuilder(
			config,
			innerSelect,
			nil,
			nil,
			projectID,
			params,
			pagination,
			orderBackward,
			orderForward)
		if err != nil {
			return nil, err
		}

		fromSb.Distinct().Limit(LogsLimit + 1)
		sb.Select(outerSelect).
			Distinct().
			From(config.TableName).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.In(fmt.Sprintf("(%s)", innerSelect), fromSb)).
			OrderBy(orderForward).
			Limit(LogsLimit + 1)
	}

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := util.StartSpanFromContext(ctx, "clickhouse.Query")
	span.SetAttribute("Table", config.TableName)
	span.SetAttribute("Query", sql)
	span.SetAttribute("Params", params)
	span.SetAttribute("db.system", "clickhouse")

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

func makeSelectBuilder[T ~string](
	config model.TableConfig[T],
	selectStr string,
	selectArgs []any,
	groupBy []string,
	projectID int,
	params modelInputs.QueryInput,
	pagination Pagination,
	orderBackward string,
	orderForward string,
) (*sqlbuilder.SelectBuilder, error) {
	sb := sqlbuilder.NewSelectBuilder()

	// selectStr can contain %s format tokens as placeholders for argument placeholders
	// use `sb.Var` to add those arguments to the sql builder and get the proper placeholder
	cols := []string{fmt.Sprintf(selectStr, lo.Map(selectArgs, func(arg any, _ int) any {
		return sb.Var(arg)
	})...)}

	for idx, group := range groupBy {
		if col, found := config.KeysToColumns[T(group)]; found {
			cols = append(cols, col)
		} else {
			cols = append(cols, sb.As("toString("+config.AttributesColumn+"["+sb.Var(group)+"])", fmt.Sprintf("g%d", idx)))
		}
	}

	sb.Select(cols...)
	sb.From(config.TableName)
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

	parser.AssignSearchFilters[T](sb, params.Query, config)

	return sb, nil
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

func KeysAggregated(ctx context.Context, client *Client, tableName string, projectID int, startDate time.Time, endDate time.Time, query *string, typeArg *modelInputs.KeyType) ([]*modelInputs.QueryKey, error) {
	chCtx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
		"max_rows_to_read": KeysMaxRows,
	}))

	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("Key, sum(Count)").
		From(tableName).
		Where(sb.Equal("ProjectId", projectID)).
		Where(fmt.Sprintf("Day >= toStartOfDay(%s)", sb.Var(startDate))).
		Where(fmt.Sprintf("Day <= toStartOfDay(%s)", sb.Var(endDate)))

	if query != nil && *query != "" {
		sb.Where(fmt.Sprintf("Key LIKE %s", sb.Var("%"+*query+"%")))
	}

	if typeArg != nil && *typeArg == modelInputs.KeyTypeNumeric {
		sb.Where(sb.Equal("Type", typeArg))
	}

	sb.GroupBy("1").
		OrderBy("2 DESC, 1").
		Limit(10)

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := util.StartSpanFromContext(chCtx, "readKeys", util.ResourceName(tableName))
	span.SetAttribute("Query", sql)
	span.SetAttribute("Table", tableName)
	span.SetAttribute("db.system", "clickhouse")

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
	span.SetAttribute("Table", tableName)
	span.SetAttribute("db.system", "clickhouse")

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

func matchesQuery[TObj interface{}, TReservedKey ~string](row *TObj, config model.TableConfig[TReservedKey], filters *queryparser.Filters) bool {
	v := reflect.ValueOf(*row)

	rowBodyTerms := map[string]bool{}
	if config.BodyColumn != "" && len(filters.Body) > 0 {
		body := v.FieldByName(config.BodyColumn).String()
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
		if chKey, ok := config.KeysToColumns[TReservedKey(key)]; ok {
			if strings.Contains(chKey, ".") {
				var value = v
				for _, part := range strings.Split(chKey, ".") {
					value = value.FieldByName(part)
					if value.Kind() == reflect.Pointer {
						value = value.Elem()
					}
				}
				rowValue = repr(value)
			} else {
				rowValue = repr(v.FieldByName(chKey))
			}
		} else if config.AttributesColumn != "" {
			value := v.FieldByName(config.AttributesColumn)
			if value.Kind() == reflect.Map {
				rowValue = repr(value.MapIndex(reflect.ValueOf(key)))
			} else if value.Kind() == reflect.Slice {
				// assume that the key is a 'field' in `type_name` format
				fieldParts := strings.SplitN(key, "_", 2)
				for i := 0; i < value.Len(); i++ {
					fieldType := value.Index(i).Elem().FieldByName("Type").String()
					name := value.Index(i).Elem().FieldByName("Name").String()
					if fieldType == fieldParts[0] && name == fieldParts[1] {
						rowValue = repr(value.Index(i).Elem().FieldByName("Value"))
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
			} else if strings.HasPrefix(v, "-") {
				if rowValue == strings.Replace(v, "-", "", 1) {
					return false
				}
			} else if v != rowValue {
				return false
			}

		}
	}
	return true
}

func getFnStr(aggregator modelInputs.MetricAggregator, column string, useSampling bool) string {
	switch aggregator {
	case modelInputs.MetricAggregatorCount:
		if useSampling {
			return "round(count() * any(_sample_factor))"
		} else {
			return "toFloat64(count())"
		}
	case modelInputs.MetricAggregatorCountDistinctKey:
		if useSampling {
			return fmt.Sprintf("round(count(distinct TraceAttributes['%s']) * any(_sample_factor))", highlight.TraceKeyAttribute)
		} else {
			return fmt.Sprintf("toFloat64(count(distinct TraceAttributes['%s']))", highlight.TraceKeyAttribute)
		}
	case modelInputs.MetricAggregatorMin:
		return fmt.Sprintf("toFloat64(min(%s))", column)
	case modelInputs.MetricAggregatorAvg:
		return fmt.Sprintf("avg(%s)", column)
	case modelInputs.MetricAggregatorP50:
		return fmt.Sprintf("quantile(.5)(%s)", column)
	case modelInputs.MetricAggregatorP90:
		return fmt.Sprintf("quantile(.9)(%s)", column)
	case modelInputs.MetricAggregatorP95:
		return fmt.Sprintf("quantile(.95)(%s)", column)
	case modelInputs.MetricAggregatorP99:
		return fmt.Sprintf("quantile(.99)(%s)", column)
	case modelInputs.MetricAggregatorMax:
		return fmt.Sprintf("toFloat64(max(%s))", column)
	case modelInputs.MetricAggregatorSum:
		if useSampling {
			return fmt.Sprintf("sum(%s) * any(_sample_factor)", column)
		} else {
			return fmt.Sprintf("sum(%s)", column)
		}
	}
	return ""
}

func readMetrics[T ~string](ctx context.Context, client *Client, sampleableConfig sampleableTableConfig[T], projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, nBuckets int, bucketBy string, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	if len(metricTypes) == 0 {
		return nil, errors.New("no metric types provided")
	}

	if bucketBy == modelInputs.MetricBucketByNone.String() {
		nBuckets = 1
	}

	startTimestamp := uint64(params.DateRange.StartDate.Unix())
	endTimestamp := uint64(params.DateRange.EndDate.Unix())
	useSampling := sampleableConfig.useSampling(params.DateRange.EndDate.Sub(params.DateRange.StartDate))

	var selectArgs []interface{}

	keysToColumns := sampleableConfig.tableConfig.KeysToColumns
	attributesColumn := sampleableConfig.tableConfig.AttributesColumn

	var metricColName string
	if col, found := keysToColumns[T(strings.ToLower(column))]; found {
		metricColName = col
	} else {
		metricColName = "toFloat64OrNull(" + attributesColumn + "[%s])"
		for _, mt := range metricTypes {
			if mt != modelInputs.MetricAggregatorCount {
				selectArgs = append(selectArgs, column)
			}
		}
	}

	switch column {
	case string(modelInputs.MetricColumnMetricValue):
		metricColName = "toFloat64OrZero(Events.Attributes[1]['metric.value'])"
		selectArgs = []interface{}{}
	}

	fnStr := strings.Join(lo.Map(metricTypes, func(agg modelInputs.MetricAggregator, _ int) string {
		return ", " + getFnStr(agg, metricColName, useSampling)
	}), "")

	var fromSb *sqlbuilder.SelectBuilder
	var err error
	var config model.TableConfig[T]
	if useSampling {
		config = sampleableConfig.samplingTableConfig
		fromSb, err = makeSelectBuilder(
			config,
			fmt.Sprintf(
				"toUInt64(intDiv(%d * (toRelativeSecondNum(Timestamp) - %d), (%d - %d))), any(_sample_factor)%s",
				nBuckets,
				startTimestamp,
				endTimestamp,
				startTimestamp,
				fnStr,
			),
			selectArgs,
			groupBy,
			projectID,
			params,
			Pagination{CountOnly: true},
			OrderBackwardNatural,
			OrderForwardNatural,
		)
	} else {
		config = sampleableConfig.tableConfig
		fromSb, err = makeSelectBuilder(
			config,
			fmt.Sprintf(
				"toUInt64(intDiv(%d * (toRelativeSecondNum(Timestamp) - %d), (%d - %d))), 1.0%s",
				nBuckets,
				startTimestamp,
				endTimestamp,
				startTimestamp,
				fnStr,
			),
			selectArgs,
			groupBy,
			projectID,
			params,
			Pagination{CountOnly: true},
			OrderBackwardNatural,
			OrderForwardNatural,
		)
	}
	if err != nil {
		return nil, err
	}

	limitCount := 100
	if limit != nil && *limit < 100 {
		limitCount = *limit
	}

	if limitAggregator != nil && len(groupBy) > 0 {
		innerSb := sqlbuilder.NewSelectBuilder()
		colStrs := []string{}
		groupByIndexes := []string{}

		for idx, group := range groupBy {
			if col, found := keysToColumns[T(group)]; found {
				colStrs = append(colStrs, col)
			} else {
				colStrs = append(colStrs, fmt.Sprintf("toString("+attributesColumn+"[%s])", innerSb.Var(group)))
			}
			groupByIndexes = append(groupByIndexes, strconv.Itoa(idx+1))
		}

		innerSb.
			From(config.TableName).
			Select(strings.Join(colStrs, ", ")).
			Where(innerSb.Equal("ProjectId", projectID)).
			Where(innerSb.GreaterEqualThan("Timestamp", startTimestamp)).
			Where(innerSb.LessEqualThan("Timestamp", endTimestamp))

		parser.AssignSearchFilters[T](innerSb, params.Query, config)

		limitFn := ""
		col := ""
		if limitColumn != nil {
			col = *limitColumn
		}
		if topCol, found := keysToColumns[T(col)]; found {
			col = topCol
		} else {
			col = fmt.Sprintf("toFloat64OrNull("+attributesColumn+"[%s])", innerSb.Var(col))
		}
		limitFn = getFnStr(*limitAggregator, col, useSampling)

		innerSb.GroupBy(groupByIndexes...).
			OrderBy(fmt.Sprintf("%s DESC", limitFn)).
			Limit(limitCount)

		fromColStrs := []string{}

		for idx, group := range groupBy {
			if col, found := keysToColumns[T(group)]; found {
				fromColStrs = append(fromColStrs, col)
			} else {
				fromColStrs = append(fromColStrs, fmt.Sprintf("g%d", idx))
			}
			groupByIndexes = append(groupByIndexes, strconv.Itoa(idx+1))
		}

		fromSb.Where(fromSb.In("("+strings.Join(fromColStrs, ", ")+")", innerSb))
	}

	base := 3 + len(metricTypes)

	groupByCols := []string{"1"}
	for i := base; i < base+len(groupBy); i++ {
		groupByCols = append(groupByCols, strconv.Itoa(i))
	}
	fromSb.GroupBy(groupByCols...)
	fromSb.OrderBy(groupByCols...)
	fromSb.Limit(10000)

	sql, args := fromSb.BuildWithFlavor(sqlbuilder.ClickHouse)

	metrics := &modelInputs.MetricsBuckets{
		Buckets: []*modelInputs.MetricBucket{},
	}

	rows, err := client.conn.Query(
		ctx,
		sql,
		args...,
	)

	if err != nil {
		return nil, err
	}

	var (
		groupKey     uint64
		sampleFactor float64
	)

	groupByColResults := make([]string, len(groupBy))
	metricResults := make([]*float64, len(metricTypes))
	scanResults := make([]interface{}, 2+len(groupByColResults) + +len(metricResults))
	scanResults[0] = &groupKey
	scanResults[1] = &sampleFactor
	for idx := range metricTypes {
		scanResults[2+idx] = &metricResults[idx]
	}
	for idx := range groupByColResults {
		scanResults[2+len(metricTypes)+idx] = &groupByColResults[idx]
	}

	for rows.Next() {
		if err := rows.Scan(scanResults...); err != nil {
			return nil, err
		}

		bucketId := groupKey
		if bucketId >= uint64(nBuckets) {
			continue
		}

		for idx, metricType := range metricTypes {
			result := metricResults[idx]
			if result == nil {
				continue
			}
			metrics.Buckets = append(metrics.Buckets, &modelInputs.MetricBucket{
				BucketID: bucketId,
				// make a slice copy as we reuse the same `groupByColResults` across multiple scans
				Group:       append(make([]string, 0), groupByColResults...),
				MetricType:  metricType,
				MetricValue: *result,
			})
		}
	}

	metrics.SampleFactor = sampleFactor
	metrics.BucketCount = uint64(nBuckets)

	return metrics, err
}

func repr(val reflect.Value) string {
	switch val.Kind() {
	case reflect.Pointer:
		return repr(val.Elem())
	case reflect.Bool:
		return fmt.Sprintf("%t", val.Bool())
	default:
		return val.String()
	}
}
