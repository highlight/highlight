package main

import (
	"github.com/antlr4-go/antlr/v4"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
	"github.com/huandu/go-sqlbuilder"
)

func Parse(program string) {
	is := antlr.NewInputStream(program)
	lexer := parser.NewSearchGrammarLexer(is)
	stream := antlr.NewCommonTokenStream(lexer, antlr.TokenDefaultChannel)
	p := parser.NewSearchGrammarParser(stream)
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("*")
	sb.From("traces")
	// listener := listener.NewSearchListener(sb, {})

	// antlr.ParseTreeWalkerDefault.Walk(listener, p.Search_query())

	// sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)
	// str, _ := sqlbuilder.ClickHouse.Interpolate(sql, args)
	// fmt.Printf("::: SQL: %+v\n", str)
	// fmt.Printf("::: ARGS: %+v\n", args)
}

func main() {
	Parse("  span_name=\"Chris Schmitz\" source=(backend OR frontend) OR (service_name!=private-graph span_name=gorm.Query span_name!=(testing OR testing2))")
}
