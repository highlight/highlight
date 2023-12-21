// Code generated from ./antlr/SearchGrammar.g4 by ANTLR 4.13.1. DO NOT EDIT.

package parser // SearchGrammar

import "github.com/antlr4-go/antlr/v4"

// SearchGrammarListener is a complete listener for a parse tree produced by SearchGrammarParser.
type SearchGrammarListener interface {
	antlr.ParseTreeListener

	// EnterSearch_query is called when entering the search_query production.
	EnterSearch_query(c *Search_queryContext)

	// EnterCol_expr is called when entering the col_expr production.
	EnterCol_expr(c *Col_exprContext)

	// EnterSearch_expr is called when entering the search_expr production.
	EnterSearch_expr(c *Search_exprContext)

	// EnterSearch_key is called when entering the search_key production.
	EnterSearch_key(c *Search_keyContext)

	// EnterSearch_op is called when entering the search_op production.
	EnterSearch_op(c *Search_opContext)

	// EnterNegation_op is called when entering the negation_op production.
	EnterNegation_op(c *Negation_opContext)

	// EnterBin_op is called when entering the bin_op production.
	EnterBin_op(c *Bin_opContext)

	// EnterSearch_value is called when entering the search_value production.
	EnterSearch_value(c *Search_valueContext)

	// ExitSearch_query is called when exiting the search_query production.
	ExitSearch_query(c *Search_queryContext)

	// ExitCol_expr is called when exiting the col_expr production.
	ExitCol_expr(c *Col_exprContext)

	// ExitSearch_expr is called when exiting the search_expr production.
	ExitSearch_expr(c *Search_exprContext)

	// ExitSearch_key is called when exiting the search_key production.
	ExitSearch_key(c *Search_keyContext)

	// ExitSearch_op is called when exiting the search_op production.
	ExitSearch_op(c *Search_opContext)

	// ExitNegation_op is called when exiting the negation_op production.
	ExitNegation_op(c *Negation_opContext)

	// ExitBin_op is called when exiting the bin_op production.
	ExitBin_op(c *Bin_opContext)

	// ExitSearch_value is called when exiting the search_value production.
	ExitSearch_value(c *Search_valueContext)
}
