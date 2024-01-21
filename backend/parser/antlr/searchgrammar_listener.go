// Code generated from ./antlr/SearchGrammar.g4 by ANTLR 4.13.1. DO NOT EDIT.

package parser // SearchGrammar

import "github.com/antlr4-go/antlr/v4"

// SearchGrammarListener is a complete listener for a parse tree produced by SearchGrammarParser.
type SearchGrammarListener interface {
	antlr.ParseTreeListener

	// EnterSearch_query is called when entering the search_query production.
	EnterSearch_query(c *Search_queryContext)

	// EnterTop_paren_col_expr is called when entering the top_paren_col_expr production.
	EnterTop_paren_col_expr(c *Top_paren_col_exprContext)

	// EnterNegated_top_col_expr is called when entering the negated_top_col_expr production.
	EnterNegated_top_col_expr(c *Negated_top_col_exprContext)

	// EnterTop_col_search_value is called when entering the top_col_search_value production.
	EnterTop_col_search_value(c *Top_col_search_valueContext)

	// EnterOr_col_expr is called when entering the or_col_expr production.
	EnterOr_col_expr(c *Or_col_exprContext)

	// EnterCol_paren_expr is called when entering the col_paren_expr production.
	EnterCol_paren_expr(c *Col_paren_exprContext)

	// EnterAnd_col_expr is called when entering the and_col_expr production.
	EnterAnd_col_expr(c *And_col_exprContext)

	// EnterNegated_col_expr is called when entering the negated_col_expr production.
	EnterNegated_col_expr(c *Negated_col_exprContext)

	// EnterCol_search_value is called when entering the col_search_value production.
	EnterCol_search_value(c *Col_search_valueContext)

	// EnterNegated_search_expr is called when entering the negated_search_expr production.
	EnterNegated_search_expr(c *Negated_search_exprContext)

	// EnterBody_search_expr is called when entering the body_search_expr production.
	EnterBody_search_expr(c *Body_search_exprContext)

	// EnterAnd_search_expr is called when entering the and_search_expr production.
	EnterAnd_search_expr(c *And_search_exprContext)

	// EnterOr_search_expr is called when entering the or_search_expr production.
	EnterOr_search_expr(c *Or_search_exprContext)

	// EnterImplicit_and_search_expr is called when entering the implicit_and_search_expr production.
	EnterImplicit_and_search_expr(c *Implicit_and_search_exprContext)

	// EnterKey_val_search_expr is called when entering the key_val_search_expr production.
	EnterKey_val_search_expr(c *Key_val_search_exprContext)

	// EnterParen_search_expr is called when entering the paren_search_expr production.
	EnterParen_search_expr(c *Paren_search_exprContext)

	// EnterSearch_key is called when entering the search_key production.
	EnterSearch_key(c *Search_keyContext)

	// EnterAnd_op is called when entering the and_op production.
	EnterAnd_op(c *And_opContext)

	// EnterImplicit_and_op is called when entering the implicit_and_op production.
	EnterImplicit_and_op(c *Implicit_and_opContext)

	// EnterOr_op is called when entering the or_op production.
	EnterOr_op(c *Or_opContext)

	// EnterNegation_op is called when entering the negation_op production.
	EnterNegation_op(c *Negation_opContext)

	// EnterBin_op is called when entering the bin_op production.
	EnterBin_op(c *Bin_opContext)

	// EnterSearch_value is called when entering the search_value production.
	EnterSearch_value(c *Search_valueContext)

	// ExitSearch_query is called when exiting the search_query production.
	ExitSearch_query(c *Search_queryContext)

	// ExitTop_paren_col_expr is called when exiting the top_paren_col_expr production.
	ExitTop_paren_col_expr(c *Top_paren_col_exprContext)

	// ExitNegated_top_col_expr is called when exiting the negated_top_col_expr production.
	ExitNegated_top_col_expr(c *Negated_top_col_exprContext)

	// ExitTop_col_search_value is called when exiting the top_col_search_value production.
	ExitTop_col_search_value(c *Top_col_search_valueContext)

	// ExitOr_col_expr is called when exiting the or_col_expr production.
	ExitOr_col_expr(c *Or_col_exprContext)

	// ExitCol_paren_expr is called when exiting the col_paren_expr production.
	ExitCol_paren_expr(c *Col_paren_exprContext)

	// ExitAnd_col_expr is called when exiting the and_col_expr production.
	ExitAnd_col_expr(c *And_col_exprContext)

	// ExitNegated_col_expr is called when exiting the negated_col_expr production.
	ExitNegated_col_expr(c *Negated_col_exprContext)

	// ExitCol_search_value is called when exiting the col_search_value production.
	ExitCol_search_value(c *Col_search_valueContext)

	// ExitNegated_search_expr is called when exiting the negated_search_expr production.
	ExitNegated_search_expr(c *Negated_search_exprContext)

	// ExitBody_search_expr is called when exiting the body_search_expr production.
	ExitBody_search_expr(c *Body_search_exprContext)

	// ExitAnd_search_expr is called when exiting the and_search_expr production.
	ExitAnd_search_expr(c *And_search_exprContext)

	// ExitOr_search_expr is called when exiting the or_search_expr production.
	ExitOr_search_expr(c *Or_search_exprContext)

	// ExitImplicit_and_search_expr is called when exiting the implicit_and_search_expr production.
	ExitImplicit_and_search_expr(c *Implicit_and_search_exprContext)

	// ExitKey_val_search_expr is called when exiting the key_val_search_expr production.
	ExitKey_val_search_expr(c *Key_val_search_exprContext)

	// ExitParen_search_expr is called when exiting the paren_search_expr production.
	ExitParen_search_expr(c *Paren_search_exprContext)

	// ExitSearch_key is called when exiting the search_key production.
	ExitSearch_key(c *Search_keyContext)

	// ExitAnd_op is called when exiting the and_op production.
	ExitAnd_op(c *And_opContext)

	// ExitImplicit_and_op is called when exiting the implicit_and_op production.
	ExitImplicit_and_op(c *Implicit_and_opContext)

	// ExitOr_op is called when exiting the or_op production.
	ExitOr_op(c *Or_opContext)

	// ExitNegation_op is called when exiting the negation_op production.
	ExitNegation_op(c *Negation_opContext)

	// ExitBin_op is called when exiting the bin_op production.
	ExitBin_op(c *Bin_opContext)

	// ExitSearch_value is called when exiting the search_value production.
	ExitSearch_value(c *Search_valueContext)
}
