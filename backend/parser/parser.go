package parser

import (
	"github.com/antlr4-go/antlr/v4"
	"github.com/highlight-run/highlight/backend/model"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
	"github.com/highlight-run/highlight/backend/parser/listener"
	"github.com/huandu/go-sqlbuilder"
)

func GetSearchListener[T ~string](sqlBuilder *sqlbuilder.SelectBuilder, query string, tableConfig model.TableConfig[T]) *listener.SearchListener[T] {
	return listener.NewSearchListener(sqlBuilder, tableConfig)
}

func GetSearchFilters[T ~string](query string, tableConfig model.TableConfig[T], listener *listener.SearchListener[T]) listener.Filters {
	is := antlr.NewInputStream(query + " " + tableConfig.DefaultFilter)
	lexer := parser.NewSearchGrammarLexer(is)
	stream := antlr.NewCommonTokenStream(lexer, antlr.TokenDefaultChannel)
	p := parser.NewSearchGrammarParser(stream)

	antlr.ParseTreeWalkerDefault.Walk(listener, p.Search_query())
	return listener.GetFilters()
}

func AssignSearchFilters[T ~string](sqlBuilder *sqlbuilder.SelectBuilder, query string, tableConfig model.TableConfig[T]) listener.Filters {
	l := GetSearchListener(sqlBuilder, query, tableConfig)
	return GetSearchFilters(query, tableConfig, l)
}

func Parse[T ~string](query string, tableConfig model.TableConfig[T]) listener.Filters {
	sqlBuilder := sqlbuilder.NewSelectBuilder().Select("*").From("t")
	return AssignSearchFilters(sqlBuilder, query, tableConfig)
}
