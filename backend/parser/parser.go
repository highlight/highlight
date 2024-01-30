package parser

import (
	"github.com/antlr4-go/antlr/v4"
	"github.com/highlight-run/highlight/backend/model"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
	"github.com/highlight-run/highlight/backend/parser/listener"
	"github.com/huandu/go-sqlbuilder"
)

func AssignSearchFilters[T ~string](sqlBuilder *sqlbuilder.SelectBuilder, query string, tableConfig model.TableConfig[T]) {
	is := antlr.NewInputStream(query + " " + tableConfig.DefaultFilter)
	lexer := parser.NewSearchGrammarLexer(is)
	stream := antlr.NewCommonTokenStream(lexer, antlr.TokenDefaultChannel)
	p := parser.NewSearchGrammarParser(stream)
	listener := listener.NewSearchListener(sqlBuilder, tableConfig)

	antlr.ParseTreeWalkerDefault.Walk(listener, p.Search_query())
}
