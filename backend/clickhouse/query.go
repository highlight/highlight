package clickhouse

import (
	"context"
	"encoding/json"
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
	"github.com/highlight-run/highlight/backend/parser/listener"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/highlight/highlight/sdk/highlight-go"
	"github.com/huandu/go-sqlbuilder"
	"github.com/nqd/flat"
	e "github.com/pkg/errors"
)

const SamplingRows = 20_000_000
const KeysMaxRows = 1_000_000
const KeyValuesMaxRows = 1_000_000

type sampleableTableConfig[TReservedKey ~string] struct {
	tableConfig         model.TableConfig[TReservedKey]
	samplingTableConfig model.TableConfig[TReservedKey]
	useSampling         func(time.Duration) bool
}

func readObjects[TObj interface{}, TReservedKey ~string](ctx context.Context, client *Client, config model.TableConfig[TReservedKey], samplingConfig model.TableConfig[TReservedKey], projectID int, params modelInputs.QueryInput, pagination Pagination, scanObject func(driver.Rows) (*Edge[TObj], error)) (*Connection[TObj], error) {
	sb := sqlbuilder.NewSelectBuilder()
	var err error
	var args []interface{}

	innerTableConfig := config
	if useSamplingTable(params) {
		innerTableConfig = samplingConfig
	}

	orderForward, _ := getSortOrders[TReservedKey](sb, pagination.Direction, config, params)

	outerSelect := strings.Join(config.SelectColumns, ", ")
	innerSelect := []string{"Timestamp", "UUID"}
	if pagination.At != nil && len(*pagination.At) > 1 {
		// Create a "window" around the cursor
		// https://stackoverflow.com/a/71738696
		beforeSb, err := makeSelectBuilder(
			innerTableConfig,
			innerSelect,
			[]int{projectID},
			params,
			Pagination{
				Before: pagination.At,
			})
		if err != nil {
			return nil, err
		}
		beforeSb.Distinct().Limit(LogsLimit/2 + 1)

		atSb, err := makeSelectBuilder(
			innerTableConfig,
			innerSelect,
			[]int{projectID},
			params,
			Pagination{
				At: pagination.At,
			})
		if err != nil {
			return nil, err
		}
		atSb.Distinct()

		afterSb, err := makeSelectBuilder(
			innerTableConfig,
			innerSelect,
			[]int{projectID},
			params,
			Pagination{
				After: pagination.At,
			})
		if err != nil {
			return nil, err
		}
		afterSb.Distinct().Limit(LogsLimit/2 + 1)

		ub := sqlbuilder.UnionAll(beforeSb, atSb, afterSb)
		sb.Select(outerSelect).
			Distinct().
			From(config.TableName).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.In(fmt.Sprintf("(%s)", strings.Join(innerSelect, ",")), ub)).
			OrderBy(orderForward)
	} else {
		fromSb, err := makeSelectBuilder(
			innerTableConfig,
			innerSelect,
			[]int{projectID},
			params,
			pagination)
		if err != nil {
			return nil, err
		}

		fromSb.Distinct().Limit(LogsLimit + 1)
		sb.Select(outerSelect).
			Distinct().
			From(config.TableName).
			Where(sb.Equal("ProjectId", projectID)).
			Where(sb.In(fmt.Sprintf("(%s)", strings.Join(innerSelect, ",")), fromSb)).
			OrderBy(orderForward).
			Limit(LogsLimit + 1)
	}

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)

	span, _ := util.StartSpanFromContext(ctx, "clickhouse.Query")
	span.SetAttribute("Table", innerTableConfig.TableName)
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
	selectCols []string,
	projectIDs []int,
	params modelInputs.QueryInput,
	pagination Pagination,
) (*sqlbuilder.SelectBuilder, error) {
	sb := sqlbuilder.NewSelectBuilder()

	orderForward, orderBackward := getSortOrders[T](sb, pagination.Direction, config, params)

	sb.Select(selectCols...)
	sb.From(config.TableName)
	sb.Where(sb.In("ProjectId", projectIDs))

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
	sb.Select("Key, Type, sum(Count)").
		From(tableName).
		Where(sb.Equal("ProjectId", projectID)).
		Where(fmt.Sprintf("Day >= toStartOfDay(%s)", sb.Var(startDate))).
		Where(fmt.Sprintf("Day <= toStartOfDay(%s)", sb.Var(endDate)))

	if query != nil && *query != "" {
		sb.Where(fmt.Sprintf("Key ILIKE %s", sb.Var("%"+*query+"%")))
	}

	if typeArg != nil && *typeArg == modelInputs.KeyTypeNumeric {
		sb.Where(sb.Equal("Type", typeArg))
	}

	sb.GroupBy("1, 2").
		OrderBy("3 DESC, 1").
		Limit(25)

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
			key     string
			keyType string
			count   uint64
		)

		if err := rows.Scan(&key, &keyType, &count); err != nil {
			return nil, err
		}

		keys = append(keys, &modelInputs.QueryKey{
			Name: key,
			Type: modelInputs.KeyType(keyType),
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

func getChildValue(value reflect.Value, key string) (string, bool) {
	for _, part := range strings.Split(key, ".") {
		if !value.IsValid() {
			return "", false
		}
		value = value.FieldByName(part)
		if value.Kind() == reflect.Pointer {
			value = value.Elem()
		}
	}
	if value.IsValid() {
		return repr(value), true
	}
	return "", false
}

// clickhouse token - https://clickhouse.com/docs/en/sql-reference/functions/splitting-merging-functions#tokens
var nonAlphaNumericChars = regexp.MustCompile(`[^\w:*]`)

// strip toString() wrapper around filter keys to match the KeysToColumns map
var keyWrapper = regexp.MustCompile(`toString\((\w+)\)`)

func matchFilter[TObj interface{}, TReservedKey ~string](row *TObj, config model.TableConfig[TReservedKey], filter *listener.FilterOperation) (bool, error) {
	key := filter.Key
	groups := keyWrapper.FindStringSubmatch(key)
	if len(groups) > 0 {
		key = groups[1]
	}
	bodyFilter := config.BodyColumn != "" && filter.Column == "" && key == config.BodyColumn
	v := reflect.ValueOf(*row)

	rowBodyTerms := map[string]bool{}
	if bodyFilter {
		body := v.FieldByName(config.BodyColumn).String()
		for _, field := range nonAlphaNumericChars.Split(body, -1) {
			if field != "" {
				rowBodyTerms[field] = true
			}
		}
		for _, bf := range filter.Values {
			if filter.Operator == listener.OperatorRegExp {
				pat, err := regexp.Compile(bf)
				if err == nil {
					matches := pat.MatchString(body)
					shouldMatch := filter.Operator == listener.OperatorRegExp

					if (shouldMatch && !matches) || (!shouldMatch && matches) {
						return false, nil
					}
				}
			} else if strings.Contains(bf, "%") {
				pat, err := regexp.Compile(strings.ReplaceAll(regexp.QuoteMeta(bf), "%", ".*"))
				// this may over match if the expression cannot be compiled,
				// but we'd prefer to over match as this fn is used to determine sampling
				if err != nil {
					return false, err
				}
				if !pat.MatchString(body) {
					return false, nil
				}
			} else if !rowBodyTerms[bf] {
				return false, nil
			}
		}
		return true, nil
	}

	var rowValue string
	if chKey, ok := config.KeysToColumns[TReservedKey(key)]; ok {
		if val, ok := getChildValue(v, chKey); ok {
			rowValue = val
		} else {
			rowValue = repr(v.FieldByName(chKey))
		}
	} else if field := v.FieldByName(key); field.IsValid() {
		rowValue = repr(field)
	} else if val, ok := getChildValue(v, key); ok {
		rowValue = val
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
		return true, e.New(fmt.Sprintf("invalid filter %s", key))
	}
	for _, v := range filter.Values {
		if filter.Operator == listener.OperatorRegExp {
			pat, err := regexp.Compile(v)
			if err == nil {
				matches := pat.MatchString(rowValue)
				shouldMatch := filter.Operator == listener.OperatorRegExp

				if (shouldMatch && !matches) || (!shouldMatch && matches) {
					return false, nil
				}
			}
		} else if strings.Contains(v, "%") {
			if matched, _ := regexp.Match(strings.ReplaceAll(v, "%", ".*"), []byte(rowValue)); !matched {
				return false, nil
			}
		} else if filter.Operator == listener.OperatorNotEqual {
			if rowValue == strings.Replace(v, "-", "", 1) {
				return false, nil
			}
		} else if v != rowValue {
			return false, nil
		}
	}
	return true, nil
}

func matchesQuery[TObj interface{}, TReservedKey ~string](row *TObj, config model.TableConfig[TReservedKey], filters listener.Filters, op listener.Operator) bool {
	// if multiple filters are passed in, assume an AND operation between them
	for _, filter := range filters {
		switch filter.Operator {
		case listener.OperatorAnd:
			for _, childFilter := range filter.Filters {
				if !matchesQuery(row, config, listener.Filters{childFilter}, filter.Operator) {
					return false
				}
			}
		case listener.OperatorOr:
			var anyMatch bool
			for _, childFilter := range filter.Filters {
				if matchesQuery(row, config, listener.Filters{childFilter}, filter.Operator) {
					anyMatch = true
					break
				}
			}
			if !anyMatch {
				return false
			}
		case listener.OperatorNot:
			return !matchesQuery(row, config, listener.Filters{filter.Filters[0]}, filter.Operator)
		default:
			matches, err := matchFilter(row, config, filter)
			if err != nil {
				if op == listener.OperatorOr {
					return false
				} else if op == listener.OperatorNot {
					return true
				} else {
					return true
				}
			}
			if !matches {
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
			return "round(count() * 1.0)"
		}
	case modelInputs.MetricAggregatorCountDistinctKey, modelInputs.MetricAggregatorCountDistinct:
		if useSampling {
			return fmt.Sprintf("round(count(distinct %s) * any(_sample_factor))", column)
		} else {
			return fmt.Sprintf("round(count(distinct %s) * 1.0)", column)
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
			return fmt.Sprintf("sum(%s) * 1.0", column)
		}
	}
	return ""
}

func readMetrics[T ~string](ctx context.Context, client *Client, sampleableConfig sampleableTableConfig[T], projectID int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, bucketCount *int, bucketBy string, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	return readWorkspaceMetrics(ctx, client, sampleableConfig, []int{projectID}, params, column, metricTypes, groupBy, bucketCount, bucketBy, limit, limitAggregator, limitColumn)
}

func getAttributeFilterCol[T ~string](sampleableConfig sampleableTableConfig[T], value, op string) (column string) {
	column = fmt.Sprintf("%s[%s]", sampleableConfig.tableConfig.AttributesColumn, value)
	if sampleableConfig.tableConfig.AttributesList {
		transform := "v"
		if op != "" {
			transform = fmt.Sprintf("%s(%s)", op, transform)
		}
		// use the first value from the resulting array, if more than one value provided
		column = fmt.Sprintf("(arrayMap((k, v) -> %s, arrayFilter((k, v) -> k = %s, %s)))[1]", transform, value, sampleableConfig.tableConfig.AttributesColumn)
	} else {
		if op != "" {
			column = fmt.Sprintf("%s(%s)", op, column)
		}
	}
	return
}

func readWorkspaceMetrics[T ~string](ctx context.Context, client *Client, sampleableConfig sampleableTableConfig[T], projectIDs []int, params modelInputs.QueryInput, column string, metricTypes []modelInputs.MetricAggregator, groupBy []string, bucketCount *int, bucketBy string, limit *int, limitAggregator *modelInputs.MetricAggregator, limitColumn *string) (*modelInputs.MetricsBuckets, error) {
	span, ctx := util.StartSpanFromContext(ctx, "clickhouse.readMetrics")
	span.SetAttribute("project_ids", projectIDs)
	span.SetAttribute("table", sampleableConfig.tableConfig.TableName)
	defer span.Finish()

	if len(metricTypes) == 0 {
		return nil, errors.New("no metric types provided")
	}

	nBuckets := 48
	if bucketBy == modelInputs.MetricBucketByNone.String() {
		nBuckets = 1
	} else if bucketCount != nil {
		nBuckets = *bucketCount
	}
	if nBuckets > 1000 {
		nBuckets = 1000
	}
	if nBuckets < 1 {
		nBuckets = 1
	}

	if params.DateRange == nil {
		params.DateRange = &modelInputs.DateRangeRequiredInput{
			StartDate: time.Now().Add(-time.Hour * 24 * 30),
			EndDate:   time.Now(),
		}
	}
	startTimestamp := params.DateRange.StartDate.Unix()
	endTimestamp := params.DateRange.EndDate.Unix()
	useSampling := sampleableConfig.useSampling(params.DateRange.EndDate.Sub(params.DateRange.StartDate))

	keysToColumns := sampleableConfig.tableConfig.KeysToColumns

	var fromSb *sqlbuilder.SelectBuilder
	var err error
	var config model.TableConfig[T]
	if useSampling {
		config = sampleableConfig.samplingTableConfig
	} else {
		config = sampleableConfig.tableConfig
	}
	var isCountDistinct bool
	for _, metricType := range metricTypes {
		if metricType == modelInputs.MetricAggregatorCountDistinct {
			isCountDistinct = true
		}
		if metricType == modelInputs.MetricAggregatorCountDistinctKey {
			isCountDistinct = true
			config.DefaultFilter = ""
		}
	}
	fromSb, err = makeSelectBuilder(
		config,
		nil,
		projectIDs,
		params,
		Pagination{CountOnly: true},
	)
	if err != nil {
		return nil, err
	}

	var col string
	if col = keysToColumns[T(strings.ToLower(column))]; col == "" {
		col = getAttributeFilterCol(sampleableConfig, fromSb.Var(column), "")
	}
	var metricExpr = col
	if !isCountDistinct {
		if reservedCol, found := keysToColumns[T(strings.ToLower(column))]; found {
			metricExpr = fmt.Sprintf("toFloat64(%s)", reservedCol)
		} else {
			metricExpr = fmt.Sprintf("toFloat64OrNull(%s)", col)
		}
	}

	switch column {
	case "":
		metricExpr = "1.0"
	}

	needsValue := false
	for _, metricType := range metricTypes {
		if metricType != modelInputs.MetricAggregatorCount {
			needsValue = true
		}
		if metricType == modelInputs.MetricAggregatorCountDistinctKey {
			metricExpr = getAttributeFilterCol(sampleableConfig, highlight.TraceKeyAttribute, "")
			config.DefaultFilter = ""
		}
	}
	if !needsValue {
		metricExpr = "1.0"
	}

	bucketExpr := "toFloat64(Timestamp)"
	if bucketBy != modelInputs.MetricBucketByNone.String() && bucketBy != modelInputs.MetricBucketByTimestamp.String() {
		if col, found := keysToColumns[T(strings.ToLower(bucketBy))]; found {
			bucketExpr = fmt.Sprintf("toFloat64(%s)", col)
		} else {
			bucketExpr = getAttributeFilterCol(sampleableConfig, fromSb.Var(bucketBy), "toFloat64OrNull")
		}
	}

	minExpr := fmt.Sprintf("MIN(%s) OVER ()", bucketExpr)
	maxExpr := fmt.Sprintf("MAX(%s) OVER ()", bucketExpr)

	if bucketBy == modelInputs.MetricBucketByTimestamp.String() || bucketBy == modelInputs.MetricBucketByNone.String() {
		minExpr = fmt.Sprintf("%d.0", startTimestamp)
		maxExpr = fmt.Sprintf("%d.0", endTimestamp)
	}

	bucketIdxExpr := fmt.Sprintf("toUInt64(intDiv((%s - %s) * %d, (%s - %s)))", bucketExpr, minExpr, nBuckets, maxExpr, minExpr)
	selectCols := []string{
		fromSb.As(bucketIdxExpr, "bucket_index"),
		fromSb.As(minExpr, "min"),
		fromSb.As(maxExpr, "max")}

	if useSampling {
		selectCols = append(selectCols, "_sample_factor")
	} else {
		selectCols = append(selectCols, fromSb.As("1.0", "_sample_factor"))
	}

	selectCols = append(selectCols, fromSb.As(metricExpr, "metric_value"))

	for idx, group := range groupBy {
		groupCol := ""
		if col, found := keysToColumns[T(group)]; found {
			groupCol = fmt.Sprintf("toString(%s)", col)
		} else {
			groupCol = getAttributeFilterCol(sampleableConfig, fromSb.Var(group), "toString")
		}
		selectCols = append(selectCols, fromSb.As(groupCol, fmt.Sprintf("g%d", idx)))
	}

	fromSb.Select(selectCols...)

	limitCount := 10
	if limit != nil {
		limitCount = *limit
	}
	if limitCount > 100 {
		limitCount = 100
	}
	if limitCount < 1 {
		limitCount = 1
	}

	if limitAggregator != nil && len(groupBy) > 0 {
		innerSb := sqlbuilder.NewSelectBuilder()
		colStrs := []string{}
		groupByIndexes := []string{}

		for idx, group := range groupBy {
			if col, found := keysToColumns[T(group)]; found {
				colStrs = append(colStrs, col)
			} else {
				colStrs = append(colStrs, getAttributeFilterCol(sampleableConfig, innerSb.Var(group), "toString"))
			}
			groupByIndexes = append(groupByIndexes, strconv.Itoa(idx+1))
		}

		innerSb.
			From(config.TableName).
			Select(strings.Join(colStrs, ", ")).
			Where(innerSb.In("ProjectId", projectIDs)).
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
			col = getAttributeFilterCol(sampleableConfig, innerSb.Var(col), "toFloat64OrNull")
		}
		limitFn = getFnStr(*limitAggregator, col, false)

		innerSb.GroupBy(groupByIndexes...).
			OrderBy(limitFn).
			Desc().
			Limit(limitCount)

		fromColStrs := []string{}
		for idx := range groupBy {
			fromColStrs = append(fromColStrs, fmt.Sprintf("g%d", idx))
		}

		fromSb.Where(fromSb.In("("+strings.Join(fromColStrs, ", ")+")", innerSb))
	}

	base := 5 + len(metricTypes)
	groupByCols := []string{"1"}
	for i := base; i < base+len(groupBy); i++ {
		groupByCols = append(groupByCols, strconv.Itoa(i))
	}

	innerSb := fromSb
	fromSb = sqlbuilder.NewSelectBuilder()
	outerSelect := []string{"bucket_index", "any(_sample_factor), any(min), any(max)"}
	for _, metricType := range metricTypes {
		outerSelect = append(outerSelect, getFnStr(metricType, "metric_value", true))
	}
	for idx := range groupBy {
		outerSelect = append(outerSelect, fmt.Sprintf("g%d", idx))
	}
	fromSb.Select(outerSelect...)
	fromSb.From(fromSb.BuilderAs(innerSb, "inner"))

	fromSb.GroupBy(groupByCols...)
	fromSb.OrderBy(groupByCols...)
	fromSb.Limit(10000)

	sql, args := fromSb.BuildWithFlavor(sqlbuilder.ClickHouse)

	metrics := &modelInputs.MetricsBuckets{
		Buckets: []*modelInputs.MetricBucket{},
	}

	span, ctx = util.StartSpanFromContext(ctx, "readMetrics.query")
	span.SetAttribute("sql", sql)
	span.SetAttribute("args", args)
	rows, err := client.conn.Query(
		ctx,
		sql,
		args...,
	)
	span.Finish(err)

	if err != nil {
		return nil, err
	}

	var (
		groupKey     uint64
		sampleFactor float64
		min          float64
		max          float64
	)

	groupByColResults := make([]string, len(groupBy))
	metricResults := make([]*float64, len(metricTypes))
	scanResults := []interface{}{}
	scanResults = append(scanResults, &groupKey)
	scanResults = append(scanResults, &sampleFactor)
	scanResults = append(scanResults, &min)
	scanResults = append(scanResults, &max)
	for idx := range metricTypes {
		scanResults = append(scanResults, &metricResults[idx])
	}
	for idx := range groupByColResults {
		scanResults = append(scanResults, &groupByColResults[idx])
	}

	lastBucketId := -1
	for rows.Next() {
		if err := rows.Scan(scanResults...); err != nil {
			return nil, err
		}

		bucketId := groupKey
		if bucketId >= uint64(nBuckets) {
			continue
		}

		// Interpolate any missing buckets
		for i := lastBucketId + 1; i < int(bucketId); i++ {
			for _, metricType := range metricTypes {
				metrics.Buckets = append(metrics.Buckets, &modelInputs.MetricBucket{
					BucketID:    uint64(i),
					BucketMin:   float64(i)*(max-min)/float64(nBuckets) + min,
					BucketMax:   float64(i+1)*(max-min)/float64(nBuckets) + min,
					Group:       append(make([]string, 0), groupByColResults...),
					MetricType:  metricType,
					MetricValue: nil,
				})
			}
		}

		for idx, metricType := range metricTypes {
			result := metricResults[idx]
			metrics.Buckets = append(metrics.Buckets, &modelInputs.MetricBucket{
				BucketID:    bucketId,
				BucketMin:   float64(bucketId)*(max-min)/float64(nBuckets) + min,
				BucketMax:   float64(bucketId+1)*(max-min)/float64(nBuckets) + min,
				Group:       append(make([]string, 0), groupByColResults...),
				MetricType:  metricType,
				MetricValue: result,
			})
		}

		lastBucketId = int(bucketId)
	}

	// Interpolate any missing buckets
	for i := lastBucketId + 1; i < nBuckets; i++ {
		for _, metricType := range metricTypes {
			metrics.Buckets = append(metrics.Buckets, &modelInputs.MetricBucket{
				BucketID:    uint64(i),
				BucketMin:   float64(i)*(max-min)/float64(nBuckets) + min,
				BucketMax:   float64(i+1)*(max-min)/float64(nBuckets) + min,
				Group:       append(make([]string, 0), groupByColResults...),
				MetricType:  metricType,
				MetricValue: nil,
			})
		}
	}

	metrics.SampleFactor = sampleFactor
	metrics.BucketCount = uint64(nBuckets)

	return metrics, err
}

func formatColumn(input string, column string) string {
	base := input
	if base == "" {
		base = "null"
	}
	return fmt.Sprintf("%s AS %s", base, column)
}

func logLines[T ~string](ctx context.Context, client *Client, tableConfig model.TableConfig[T], projectID int, params modelInputs.QueryInput) ([]*modelInputs.LogLine, error) {
	body := formatColumn(tableConfig.BodyColumn, "Body")
	severity := formatColumn(tableConfig.SeverityColumn, "Severity")
	attributes := formatColumn(tableConfig.AttributesColumn, "Labels")
	fromSb, err := makeSelectBuilder(
		tableConfig,
		[]string{"Timestamp", body, severity, attributes},
		[]int{projectID},
		params,
		Pagination{CountOnly: true},
	)
	if err != nil {
		return nil, err
	}
	fromSb.Limit(1000)

	sql, args := fromSb.BuildWithFlavor(sqlbuilder.ClickHouse)

	logLines := []*modelInputs.LogLine{}

	rows, err := client.conn.Query(
		ctx,
		sql,
		args...,
	)

	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var result struct {
			Timestamp time.Time
			Body      string
			Severity  string
			Labels    map[string]string
		}
		if err := rows.ScanStruct(&result); err != nil {
			return nil, err
		}

		labelsJson, err := json.Marshal(expandJSON(result.Labels))
		if err != nil {
			return nil, err
		}

		var severity *modelInputs.LogLevel
		if result.Severity != "" {
			logLevel := makeLogLevel(result.Severity)
			severity = &logLevel
		}
		logLines = append(logLines, &modelInputs.LogLine{
			Timestamp: result.Timestamp,
			Body:      result.Body,
			Severity:  severity,
			Labels:    string(labelsJson),
		})
	}

	return logLines, err
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

func getSortOrders[TReservedKey ~string](
	sb *sqlbuilder.SelectBuilder,
	paginationDirection modelInputs.SortDirection,
	config model.TableConfig[TReservedKey],
	params modelInputs.QueryInput,
) (string, string) {
	sortColumn := "timestamp"
	sortDirection := modelInputs.SortDirectionDesc
	if params.Sort != nil {
		sortColumn = params.Sort.Column
		sortDirection = params.Sort.Direction
	}

	if col, found := config.KeysToColumns[TReservedKey(sortColumn)]; found {
		sortColumn = col
	} else {
		sortColumn = fmt.Sprintf("%s[%s]", config.AttributesColumn, sb.Var(sortColumn))
	}

	forwardDirection := "DESC"
	backwardDirection := "ASC"
	if paginationDirection == modelInputs.SortDirectionAsc || sortDirection == modelInputs.SortDirectionAsc {
		forwardDirection = "ASC"
	} else {
		backwardDirection = "DESC"
	}

	orderForward := fmt.Sprintf("%s %s, UUID %s", sortColumn, forwardDirection, forwardDirection)
	orderBackward := fmt.Sprintf("%s %s, UUID %s", sortColumn, backwardDirection, backwardDirection)

	return orderForward, orderBackward
}

func useSamplingTable(params modelInputs.QueryInput) bool {
	// If we have a non-default sort column use the sampling table
	return params.Sort != nil && strings.ToLower(params.Sort.Column) != "timestamp"
}
