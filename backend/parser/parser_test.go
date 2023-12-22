package parser

import (
	"testing"

	"github.com/huandu/go-assert"
	"github.com/huandu/go-sqlbuilder"
)

var BodyKey = "DEFAULT"

var KeysToColumns = map[string]string{
	"duration":     "Duration",
	"level":        "Level",
	"span_name":    "SpanName",
	"service_name": "ServiceName",
	"source":       "Source",
}

func TestBasicSqlForSearch(t *testing.T) {
	sql, _ := buildSqlForQuery("span_name:gorm.Query")
	assert.Equal(t, "SELECT * FROM t WHERE SpanName = 'gorm.Query'", sql)
}

func TestCoimplexSqlForSearch(t *testing.T) {
	sql, _ := buildSqlForQuery("span_name=\"Chris Schmitz\" duration>1000 level:info source=(backend OR frontend) OR (service_name!=private-graph span_name=gorm.Query span_name!=(testing OR testing2)) \"body query\"")

	assert.Equal(
		t,
		"SELECT * FROM t WHERE ((((SpanName = 'Chris Schmitz' AND Duration > '1000') AND Level = 'info') AND (Source = 'backend' OR Source = 'frontend')) OR (((ServiceName <> 'private-graph' AND SpanName = 'gorm.Query') AND (SpanName <> 'testing' OR SpanName <> 'testing2')) AND SpanName <> 'body query'))",
		sql,
	)
}

func buildSqlForQuery(query string) (string, error) {
	sqlBuilder := sqlbuilder.NewSelectBuilder()
	sb := sqlBuilder.Select("*").From("t")
	AssignSearchFilters(sb, query, BodyKey, KeysToColumns)
	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)
	return sqlbuilder.ClickHouse.Interpolate(sql, args)
}
