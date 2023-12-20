package main

import (
	"fmt"

	"github.com/antlr4-go/antlr/v4"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
	"github.com/highlight-run/highlight/backend/parser/listener"
)

type echoListener struct {
	parser.SearchGrammarListener
}

func (s *echoListener) EnterSearch_query(ctx *parser.Search_queryContext) {
	fmt.Printf("::: EnterSearch_query: %v\n", ctx.GetText())
}

func (s *echoListener) EnterSearch_expr(ctx *parser.Search_queryContext) {
	fmt.Printf("::: EnterSearch_expr: %v\n", ctx.GetText())
}

func (s *echoListener) VisitTerminal(node antlr.TerminalNode) {
	fmt.Printf("::: VisitTerminal: %v\n", node.GetText())
}

func Parse(program string) {
	is := antlr.NewInputStream(program)
	lexer := parser.NewSearchGrammarLexer(is)
	stream := antlr.NewCommonTokenStream(lexer, antlr.TokenDefaultChannel)
	p := parser.NewSearchGrammarParser(stream)
	listener := listener.NewSearchListener()

	antlr.ParseTreeWalkerDefault.Walk(listener, p.Search_query())
}

func main() {
	Parse("span_name=gorm.Query")
}
