package main

import (
	"fmt"

	"github.com/antlr4-go/antlr/v4"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
	"github.com/highlight-run/highlight/backend/parser/listener"
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
	bodyColumn := "span_name"
	keysToColumns := map[string]string{
		"duration":     "Duration",
		"level":        "Level",
		"span_name":    "SpanName",
		"service_name": "ServiceName",
		"source":       "Source",
	}
	searchListener := listener.NewSearchListener(sb, bodyColumn, keysToColumns)

	antlr.ParseTreeWalkerDefault.Walk(searchListener, p.Search_query())

	sql, args := sb.BuildWithFlavor(sqlbuilder.ClickHouse)
	str, _ := sqlbuilder.ClickHouse.Interpolate(sql, args)
	fmt.Printf("::: SQL: %+v\n", str)
}

func main() {
	Parse("span_name=\"Chris Schmitz\" duration>1000 level:info source=(backend OR frontend) OR (service_name!=private-graph span_name=gorm.Query span_name!=(testing OR testing2)) \"body query\"")
}
