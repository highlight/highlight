package listener

import (
	"fmt"

	"github.com/antlr4-go/antlr/v4"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
)

// TODO: Think through logic for building up SQL queries from this. Will an
// expression be enough, or do we need additional grouping logic in case there
// are grouped expressions with parens, or it's required for OR logic? Or maybe
// we create a listener we can pass the SQL builder to, and it can build up the
// query as it walks the tree?

var DefaultFilterKey = "message"
var DefaultFilterOp = "="

type Expression struct {
	Key   string
	Op    string
	Value []string
}

type searchListener struct {
	parser.SearchGrammarListener

	CurrentExpression Expression
	Expressions       []Expression
}

func NewSearchListener() *searchListener {
	return &searchListener{
		CurrentExpression: Expression{},
		Expressions:       []Expression{},
	}
}

func (s *searchListener) EnterSearch_query(ctx *parser.Search_queryContext) {}

func (s *searchListener) EnterSearch_expr(ctx *parser.Search_exprContext) {
	s.CurrentExpression = Expression{
		Key:   DefaultFilterKey,
		Op:    DefaultFilterOp,
		Value: []string{},
	}
}

func (s *searchListener) EnterSearch_key(ctx *parser.Search_keyContext) {
	s.CurrentExpression.Key = ctx.GetText()
}

func (s *searchListener) EnterBin_op(ctx *parser.Bin_opContext) {
	s.CurrentExpression.Op = ctx.GetText()
}

func (s *searchListener) EnterCol_expr(ctx *parser.Col_exprContext) {}

func (s *searchListener) EnterSearch_op(ctx *parser.Search_opContext) {
	op := ctx.GetText()

	// Handling a top-level operator
	if s.CurrentExpression.Key == "" {
		if op == "OR" {
			fmt.Printf("::: TODO: Handle OR\n")
		}
	}
}

func (s *searchListener) EnterNegation_op(ctx *parser.Negation_opContext) {}

func (s *searchListener) EnterSearch_value(ctx *parser.Search_valueContext) {
	s.CurrentExpression.Value = append(s.CurrentExpression.Value, ctx.GetText())
}

func (s *searchListener) ExitSearch_expr(ctx *parser.Search_exprContext) {
	if len(s.CurrentExpression.Value) > 0 {
		s.Expressions = append(s.Expressions, s.CurrentExpression)
		s.CurrentExpression = Expression{}
	}
}

func (s *searchListener) ExitSearch_query(ctx *parser.Search_queryContext) {
	fmt.Printf("::: ExitSearch_query: %+v\n", s.Expressions)
}
func (s *searchListener) ExitCol_expr(ctx *parser.Col_exprContext)         {}
func (s *searchListener) ExitSearch_op(ctx *parser.Search_opContext)       {}
func (s *searchListener) ExitNegation_op(ctx *parser.Negation_opContext)   {}
func (s *searchListener) ExitSearch_value(ctx *parser.Search_valueContext) {}
func (s *searchListener) ExitSearch_key(ctx *parser.Search_keyContext)     {}
func (s *searchListener) ExitBin_op(ctx *parser.Bin_opContext)             {}

func (s *searchListener) VisitTerminal(node antlr.TerminalNode) {}
func (s *searchListener) VisitErrorNode(node antlr.ErrorNode)   {}

func (s *searchListener) EnterEveryRule(node antlr.ParserRuleContext) {}
func (s *searchListener) ExitEveryRule(node antlr.ParserRuleContext)  {}

func (s *searchListener) GetExpressions() []Expression {
	return s.Expressions
}
