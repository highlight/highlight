package parser

import (
	"testing"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/huandu/go-assert"
	"github.com/huandu/go-sqlbuilder"
)

var tableConfig = model.TableConfig[string]{
	KeysToColumns: map[string]string{
		"duration":     "Duration",
		"level":        "Level",
		"span_name":    "SpanName",
		"service_name": "ServiceName",
		"source":       "Source",
	},
	BodyColumn:       "SpanName",
	AttributesColumn: "TraceAttributes",
}

func TestBasicSqlForSearch(t *testing.T) {
	sql, _ := buildSqlForQuery("span_name:gorm.Query")
	assert.Equal(t, "SELECT * FROM t WHERE toString(SpanName) = 'gorm.Query'", sql)
}

func TestComplexSqlForSearch(t *testing.T) {
	sql, _ := buildSqlForQuery("span_name=\"Chris Schmitz\" duration>1000 level:info source=(backend OR frontend) OR (service_name!=private-graph span_name=gorm.Query span_name!=(testing OR testing2)) AND (\"body query\" asdf)")

	assert.Equal(
		t,
		"SELECT * FROM t WHERE toString(SpanName) = 'Chris Schmitz' AND Duration > '1000' AND toString(Level) = 'info' AND (toString(Source) = 'backend' OR toString(Source) = 'frontend') AND NOT (toString(ServiceName) = 'private-graph') AND toString(SpanName) = 'gorm.Query' AND (NOT ((toString(SpanName) = 'testing' OR toString(SpanName) = 'testing2')) OR (SpanName ILIKE '%body query%' AND hasTokenCaseInsensitive(SpanName, 'asdf')))",
		sql,
	)
}

func TestMultipleBodyFiltersSearch(t *testing.T) {
	sql, _ := buildSqlForQuery("asdf fdsa")
	assert.Equal(t, "SELECT * FROM t WHERE hasTokenCaseInsensitive(SpanName, 'asdf') AND hasTokenCaseInsensitive(SpanName, 'fdsa')", sql)
}

func TestAttributesSearch(t *testing.T) {
	sql, _ := buildSqlForQuery("custom=attribute")
	assert.Equal(t, "SELECT * FROM t WHERE TraceAttributes['custom'] = 'attribute'", sql)
}

func TestWildcardSearch(t *testing.T) {
	sql, _ := buildSqlForQuery("*asdf* service_name=*-graph")
	assert.Equal(t, "SELECT * FROM t WHERE SpanName ILIKE '%asdf%' AND ServiceName ILIKE '%-graph%'", sql)
}

func buildSqlForQuery(query string) (string, error) {
	sqlBuilder := sqlbuilder.NewSelectBuilder()
	sb := sqlBuilder.Select("*").From("t")
	_ = AssignSearchFilters(sb, query, tableConfig)
	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)
	return sqlbuilder.ClickHouse.Interpolate(sql, args)
}
