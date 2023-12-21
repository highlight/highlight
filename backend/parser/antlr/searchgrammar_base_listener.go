// Code generated from ./antlr/SearchGrammar.g4 by ANTLR 4.13.1. DO NOT EDIT.

package parser // SearchGrammar

import "github.com/antlr4-go/antlr/v4"

// BaseSearchGrammarListener is a complete listener for a parse tree produced by SearchGrammarParser.
type BaseSearchGrammarListener struct{}

var _ SearchGrammarListener = &BaseSearchGrammarListener{}

// VisitTerminal is called when a terminal node is visited.
func (s *BaseSearchGrammarListener) VisitTerminal(node antlr.TerminalNode) {}

// VisitErrorNode is called when an error node is visited.
func (s *BaseSearchGrammarListener) VisitErrorNode(node antlr.ErrorNode) {}

// EnterEveryRule is called when any rule is entered.
func (s *BaseSearchGrammarListener) EnterEveryRule(ctx antlr.ParserRuleContext) {}

// ExitEveryRule is called when any rule is exited.
func (s *BaseSearchGrammarListener) ExitEveryRule(ctx antlr.ParserRuleContext) {}

// EnterSearch_query is called when production search_query is entered.
func (s *BaseSearchGrammarListener) EnterSearch_query(ctx *Search_queryContext) {}

// ExitSearch_query is called when production search_query is exited.
func (s *BaseSearchGrammarListener) ExitSearch_query(ctx *Search_queryContext) {}

// EnterCol_expr is called when production col_expr is entered.
func (s *BaseSearchGrammarListener) EnterCol_expr(ctx *Col_exprContext) {}

// ExitCol_expr is called when production col_expr is exited.
func (s *BaseSearchGrammarListener) ExitCol_expr(ctx *Col_exprContext) {}

// EnterSearch_expr is called when production search_expr is entered.
func (s *BaseSearchGrammarListener) EnterSearch_expr(ctx *Search_exprContext) {}

// ExitSearch_expr is called when production search_expr is exited.
func (s *BaseSearchGrammarListener) ExitSearch_expr(ctx *Search_exprContext) {}

// EnterSearch_key is called when production search_key is entered.
func (s *BaseSearchGrammarListener) EnterSearch_key(ctx *Search_keyContext) {}

// ExitSearch_key is called when production search_key is exited.
func (s *BaseSearchGrammarListener) ExitSearch_key(ctx *Search_keyContext) {}

// EnterSearch_op is called when production search_op is entered.
func (s *BaseSearchGrammarListener) EnterSearch_op(ctx *Search_opContext) {}

// ExitSearch_op is called when production search_op is exited.
func (s *BaseSearchGrammarListener) ExitSearch_op(ctx *Search_opContext) {}

// EnterNegation_op is called when production negation_op is entered.
func (s *BaseSearchGrammarListener) EnterNegation_op(ctx *Negation_opContext) {}

// ExitNegation_op is called when production negation_op is exited.
func (s *BaseSearchGrammarListener) ExitNegation_op(ctx *Negation_opContext) {}

// EnterBin_op is called when production bin_op is entered.
func (s *BaseSearchGrammarListener) EnterBin_op(ctx *Bin_opContext) {}

// ExitBin_op is called when production bin_op is exited.
func (s *BaseSearchGrammarListener) ExitBin_op(ctx *Bin_opContext) {}

// EnterSearch_value is called when production search_value is entered.
func (s *BaseSearchGrammarListener) EnterSearch_value(ctx *Search_valueContext) {}

// ExitSearch_value is called when production search_value is exited.
func (s *BaseSearchGrammarListener) ExitSearch_value(ctx *Search_valueContext) {}
