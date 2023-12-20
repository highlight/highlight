package listener

import (
	"fmt"

	"github.com/antlr4-go/antlr/v4"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
)

type searchListener struct {
	parser.SearchGrammarListener
}

func NewSearchListener() *searchListener {
	return &searchListener{}
}

func (s *searchListener) EnterSearch_query(ctx *parser.Search_queryContext) {
	fmt.Printf("::: EnterSearch_query: %v\n", ctx.GetText())
}

func (s *searchListener) EnterCol_expr(ctx *parser.Col_exprContext) {
	fmt.Printf("::: EnterCol_expr: %v\n", ctx.GetText())
}

func (s *searchListener) EnterSearch_expr(ctx *parser.Search_exprContext) {
	fmt.Printf("::: EnterSearch_expr: %v\n", ctx.GetText())
}

func (s *searchListener) EnterSearch_key(ctx *parser.Search_keyContext) {
	fmt.Printf("::: EnterSearch_key: %v\n", ctx.GetText())
}

func (s *searchListener) EnterBin_op(ctx *parser.Bin_opContext) {
	fmt.Printf("::: EnterBin_op: %v\n", ctx.GetText())
}

func (s *searchListener) ExitSearch_query(ctx *parser.Search_queryContext) {
	fmt.Printf("::: ExitSearch_query: %v\n", ctx.GetText())
}

func (s *searchListener) ExitCol_expr(ctx *parser.Col_exprContext) {
	fmt.Printf("::: ExitCol_expr: %v\n", ctx.GetText())
}

func (s *searchListener) ExitSearch_expr(ctx *parser.Search_exprContext) {
	fmt.Printf("::: ExitSearch_expr: %v\n", ctx.GetText())
}

func (s *searchListener) ExitSearch_key(ctx *parser.Search_keyContext) {
	fmt.Printf("::: ExitSearch_key: %v\n", ctx.GetText())
}

func (s *searchListener) ExitBin_op(ctx *parser.Bin_opContext) {
	fmt.Printf("::: ExitBin_op: %v\n", ctx.GetText())
}

func (s *searchListener) VisitTerminal(node antlr.TerminalNode) {
	fmt.Printf("::: VisitTerminal: %v\n", node.GetText())
}

func (s *searchListener) VisitErrorNode(node antlr.ErrorNode) {
	fmt.Printf("::: VisitErrorNode: %v\n", node.GetText())
}

func (s *searchListener) EnterEveryRule(node antlr.ParserRuleContext) {
	fmt.Printf("::: EnterEveryRule: %v\n", node.GetText())
}

func (s *searchListener) ExitEveryRule(node antlr.ParserRuleContext) {
	fmt.Printf("::: ExitEveryRule: %v\n", node.GetText())
}
