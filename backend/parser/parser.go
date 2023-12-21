package parser

import (
	"github.com/antlr4-go/antlr/v4"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
	"github.com/highlight-run/highlight/backend/parser/listener"
)

func BuildFiltersForSearchQuery(query string) []listener.Expression {
	is := antlr.NewInputStream(query)
	lexer := parser.NewSearchGrammarLexer(is)
	stream := antlr.NewCommonTokenStream(lexer, antlr.TokenDefaultChannel)
	p := parser.NewSearchGrammarParser(stream)
	listener := listener.NewSearchListener()

	antlr.ParseTreeWalkerDefault.Walk(listener, p.Search_query())

	return listener.GetExpressions()
}
