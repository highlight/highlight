package parser

import (
	"github.com/antlr4-go/antlr/v4"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
	"github.com/highlight-run/highlight/backend/parser/listener"
	"github.com/huandu/go-sqlbuilder"
)

func AssignSearchFilters(sqlBuilder *sqlbuilder.SelectBuilder, query string, bodyColumn string, keysToColumns map[string]string) {
	is := antlr.NewInputStream(query)
	lexer := parser.NewSearchGrammarLexer(is)
	stream := antlr.NewCommonTokenStream(lexer, antlr.TokenDefaultChannel)
	p := parser.NewSearchGrammarParser(stream)
	listener := listener.NewSearchListener(sqlBuilder, bodyColumn, keysToColumns)

	antlr.ParseTreeWalkerDefault.Walk(listener, p.Search_query())
}
