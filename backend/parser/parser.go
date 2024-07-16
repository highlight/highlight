package parser

import (
	"strings"

	"github.com/antlr4-go/antlr/v4"
	"github.com/highlight-run/highlight/backend/model"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
	"github.com/highlight-run/highlight/backend/parser/listener"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/huandu/go-sqlbuilder"
	"go.opentelemetry.io/otel/trace"
)

func GetSearchListener(sqlBuilder *sqlbuilder.SelectBuilder, query string, tableConfig model.TableConfig) *listener.SearchListener {
	return listener.NewSearchListener(sqlBuilder, tableConfig)
}

func GetSearchFilters(query string, tableConfig model.TableConfig, listener *listener.SearchListener) listener.Filters {
	s := util.StartSpan("GetSearchFilters", util.WithSpanKind(trace.SpanKindServer), util.Tag("query", query))
	defer s.Finish()

	if !strings.Contains(query, string(modelInputs.ReservedTraceKeyMetricName)) {
		query = query + " " + tableConfig.DefaultFilter
	}
	is := antlr.NewInputStream(query)
	lexer := parser.NewSearchGrammarLexer(is)
	stream := antlr.NewCommonTokenStream(lexer, antlr.TokenDefaultChannel)
	p := parser.NewSearchGrammarParser(stream)

	antlr.ParseTreeWalkerDefault.Walk(listener, p.Search_query())
	s.SetAttribute("processed_query", query)
	return listener.GetFilters()
}

func AssignSearchFilters(sqlBuilder *sqlbuilder.SelectBuilder, query string, tableConfig model.TableConfig) listener.Filters {
	l := GetSearchListener(sqlBuilder, query, tableConfig)
	return GetSearchFilters(query, tableConfig, l)
}

func Parse(query string, tableConfig model.TableConfig) listener.Filters {
	sqlBuilder := sqlbuilder.NewSelectBuilder().Select("*").From("t")
	return AssignSearchFilters(sqlBuilder, query, tableConfig)
}
