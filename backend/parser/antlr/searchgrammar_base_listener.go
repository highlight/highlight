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

// EnterTop_paren_col_expr is called when production top_paren_col_expr is entered.
func (s *BaseSearchGrammarListener) EnterTop_paren_col_expr(ctx *Top_paren_col_exprContext) {}

// ExitTop_paren_col_expr is called when production top_paren_col_expr is exited.
func (s *BaseSearchGrammarListener) ExitTop_paren_col_expr(ctx *Top_paren_col_exprContext) {}

// EnterNegated_top_col_expr is called when production negated_top_col_expr is entered.
func (s *BaseSearchGrammarListener) EnterNegated_top_col_expr(ctx *Negated_top_col_exprContext) {}

// ExitNegated_top_col_expr is called when production negated_top_col_expr is exited.
func (s *BaseSearchGrammarListener) ExitNegated_top_col_expr(ctx *Negated_top_col_exprContext) {}

// EnterTop_col_search_value is called when production top_col_search_value is entered.
func (s *BaseSearchGrammarListener) EnterTop_col_search_value(ctx *Top_col_search_valueContext) {}

// ExitTop_col_search_value is called when production top_col_search_value is exited.
func (s *BaseSearchGrammarListener) ExitTop_col_search_value(ctx *Top_col_search_valueContext) {}

// EnterOr_col_expr is called when production or_col_expr is entered.
func (s *BaseSearchGrammarListener) EnterOr_col_expr(ctx *Or_col_exprContext) {}

// ExitOr_col_expr is called when production or_col_expr is exited.
func (s *BaseSearchGrammarListener) ExitOr_col_expr(ctx *Or_col_exprContext) {}

// EnterCol_paren_expr is called when production col_paren_expr is entered.
func (s *BaseSearchGrammarListener) EnterCol_paren_expr(ctx *Col_paren_exprContext) {}

// ExitCol_paren_expr is called when production col_paren_expr is exited.
func (s *BaseSearchGrammarListener) ExitCol_paren_expr(ctx *Col_paren_exprContext) {}

// EnterAnd_col_expr is called when production and_col_expr is entered.
func (s *BaseSearchGrammarListener) EnterAnd_col_expr(ctx *And_col_exprContext) {}

// ExitAnd_col_expr is called when production and_col_expr is exited.
func (s *BaseSearchGrammarListener) ExitAnd_col_expr(ctx *And_col_exprContext) {}

// EnterNegated_col_expr is called when production negated_col_expr is entered.
func (s *BaseSearchGrammarListener) EnterNegated_col_expr(ctx *Negated_col_exprContext) {}

// ExitNegated_col_expr is called when production negated_col_expr is exited.
func (s *BaseSearchGrammarListener) ExitNegated_col_expr(ctx *Negated_col_exprContext) {}

// EnterCol_search_value is called when production col_search_value is entered.
func (s *BaseSearchGrammarListener) EnterCol_search_value(ctx *Col_search_valueContext) {}

// ExitCol_search_value is called when production col_search_value is exited.
func (s *BaseSearchGrammarListener) ExitCol_search_value(ctx *Col_search_valueContext) {}

// EnterNegated_search_expr is called when production negated_search_expr is entered.
func (s *BaseSearchGrammarListener) EnterNegated_search_expr(ctx *Negated_search_exprContext) {}

// ExitNegated_search_expr is called when production negated_search_expr is exited.
func (s *BaseSearchGrammarListener) ExitNegated_search_expr(ctx *Negated_search_exprContext) {}

// EnterBody_search_expr is called when production body_search_expr is entered.
func (s *BaseSearchGrammarListener) EnterBody_search_expr(ctx *Body_search_exprContext) {}

// ExitBody_search_expr is called when production body_search_expr is exited.
func (s *BaseSearchGrammarListener) ExitBody_search_expr(ctx *Body_search_exprContext) {}

// EnterAnd_search_expr is called when production and_search_expr is entered.
func (s *BaseSearchGrammarListener) EnterAnd_search_expr(ctx *And_search_exprContext) {}

// ExitAnd_search_expr is called when production and_search_expr is exited.
func (s *BaseSearchGrammarListener) ExitAnd_search_expr(ctx *And_search_exprContext) {}

// EnterOr_search_expr is called when production or_search_expr is entered.
func (s *BaseSearchGrammarListener) EnterOr_search_expr(ctx *Or_search_exprContext) {}

// ExitOr_search_expr is called when production or_search_expr is exited.
func (s *BaseSearchGrammarListener) ExitOr_search_expr(ctx *Or_search_exprContext) {}

// EnterImplicit_and_search_expr is called when production implicit_and_search_expr is entered.
func (s *BaseSearchGrammarListener) EnterImplicit_and_search_expr(ctx *Implicit_and_search_exprContext) {
}

// ExitImplicit_and_search_expr is called when production implicit_and_search_expr is exited.
func (s *BaseSearchGrammarListener) ExitImplicit_and_search_expr(ctx *Implicit_and_search_exprContext) {
}

// EnterExists_search_expr is called when production exists_search_expr is entered.
func (s *BaseSearchGrammarListener) EnterExists_search_expr(ctx *Exists_search_exprContext) {}

// ExitExists_search_expr is called when production exists_search_expr is exited.
func (s *BaseSearchGrammarListener) ExitExists_search_expr(ctx *Exists_search_exprContext) {}

// EnterKey_val_search_expr is called when production key_val_search_expr is entered.
func (s *BaseSearchGrammarListener) EnterKey_val_search_expr(ctx *Key_val_search_exprContext) {}

// ExitKey_val_search_expr is called when production key_val_search_expr is exited.
func (s *BaseSearchGrammarListener) ExitKey_val_search_expr(ctx *Key_val_search_exprContext) {}

// EnterParen_search_expr is called when production paren_search_expr is entered.
func (s *BaseSearchGrammarListener) EnterParen_search_expr(ctx *Paren_search_exprContext) {}

// ExitParen_search_expr is called when production paren_search_expr is exited.
func (s *BaseSearchGrammarListener) ExitParen_search_expr(ctx *Paren_search_exprContext) {}

// EnterSearch_key is called when production search_key is entered.
func (s *BaseSearchGrammarListener) EnterSearch_key(ctx *Search_keyContext) {}

// ExitSearch_key is called when production search_key is exited.
func (s *BaseSearchGrammarListener) ExitSearch_key(ctx *Search_keyContext) {}

// EnterAnd_op is called when production and_op is entered.
func (s *BaseSearchGrammarListener) EnterAnd_op(ctx *And_opContext) {}

// ExitAnd_op is called when production and_op is exited.
func (s *BaseSearchGrammarListener) ExitAnd_op(ctx *And_opContext) {}

// EnterImplicit_and_op is called when production implicit_and_op is entered.
func (s *BaseSearchGrammarListener) EnterImplicit_and_op(ctx *Implicit_and_opContext) {}

// ExitImplicit_and_op is called when production implicit_and_op is exited.
func (s *BaseSearchGrammarListener) ExitImplicit_and_op(ctx *Implicit_and_opContext) {}

// EnterOr_op is called when production or_op is entered.
func (s *BaseSearchGrammarListener) EnterOr_op(ctx *Or_opContext) {}

// ExitOr_op is called when production or_op is exited.
func (s *BaseSearchGrammarListener) ExitOr_op(ctx *Or_opContext) {}

// EnterExists_op is called when production exists_op is entered.
func (s *BaseSearchGrammarListener) EnterExists_op(ctx *Exists_opContext) {}

// ExitExists_op is called when production exists_op is exited.
func (s *BaseSearchGrammarListener) ExitExists_op(ctx *Exists_opContext) {}

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
