// Generated from ./antlr/SearchGrammar.g4 by ANTLR 4.13.1

import { ParseTreeListener } from 'antlr4'

import { Search_queryContext } from './SearchGrammarParser'
import { Top_paren_col_exprContext } from './SearchGrammarParser'
import { Negated_top_col_exprContext } from './SearchGrammarParser'
import { Top_col_search_valueContext } from './SearchGrammarParser'
import { Or_col_exprContext } from './SearchGrammarParser'
import { Col_paren_exprContext } from './SearchGrammarParser'
import { And_col_exprContext } from './SearchGrammarParser'
import { Negated_col_exprContext } from './SearchGrammarParser'
import { Col_search_valueContext } from './SearchGrammarParser'
import { Negated_search_exprContext } from './SearchGrammarParser'
import { Body_search_exprContext } from './SearchGrammarParser'
import { And_search_exprContext } from './SearchGrammarParser'
import { Or_search_exprContext } from './SearchGrammarParser'
import { Implicit_and_search_exprContext } from './SearchGrammarParser'
import { Exists_search_exprContext } from './SearchGrammarParser'
import { Key_val_search_exprContext } from './SearchGrammarParser'
import { Paren_search_exprContext } from './SearchGrammarParser'
import { Search_keyContext } from './SearchGrammarParser'
import { And_opContext } from './SearchGrammarParser'
import { Implicit_and_opContext } from './SearchGrammarParser'
import { Or_opContext } from './SearchGrammarParser'
import { Exists_opContext } from './SearchGrammarParser'
import { Negation_opContext } from './SearchGrammarParser'
import { Bin_opContext } from './SearchGrammarParser'
import { Search_valueContext } from './SearchGrammarParser'

/**
 * This interface defines a complete listener for a parse tree produced by
 * `SearchGrammarParser`.
 */
export default class SearchGrammarListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `SearchGrammarParser.search_query`.
	 * @param ctx the parse tree
	 */
	enterSearch_query?: (ctx: Search_queryContext) => void
	/**
	 * Exit a parse tree produced by `SearchGrammarParser.search_query`.
	 * @param ctx the parse tree
	 */
	exitSearch_query?: (ctx: Search_queryContext) => void
	/**
	 * Enter a parse tree produced by the `top_paren_col_expr`
	 * labeled alternative in `SearchGrammarParser.top_col_expr`.
	 * @param ctx the parse tree
	 */
	enterTop_paren_col_expr?: (ctx: Top_paren_col_exprContext) => void
	/**
	 * Exit a parse tree produced by the `top_paren_col_expr`
	 * labeled alternative in `SearchGrammarParser.top_col_expr`.
	 * @param ctx the parse tree
	 */
	exitTop_paren_col_expr?: (ctx: Top_paren_col_exprContext) => void
	/**
	 * Enter a parse tree produced by the `negated_top_col_expr`
	 * labeled alternative in `SearchGrammarParser.top_col_expr`.
	 * @param ctx the parse tree
	 */
	enterNegated_top_col_expr?: (ctx: Negated_top_col_exprContext) => void
	/**
	 * Exit a parse tree produced by the `negated_top_col_expr`
	 * labeled alternative in `SearchGrammarParser.top_col_expr`.
	 * @param ctx the parse tree
	 */
	exitNegated_top_col_expr?: (ctx: Negated_top_col_exprContext) => void
	/**
	 * Enter a parse tree produced by the `top_col_search_value`
	 * labeled alternative in `SearchGrammarParser.top_col_expr`.
	 * @param ctx the parse tree
	 */
	enterTop_col_search_value?: (ctx: Top_col_search_valueContext) => void
	/**
	 * Exit a parse tree produced by the `top_col_search_value`
	 * labeled alternative in `SearchGrammarParser.top_col_expr`.
	 * @param ctx the parse tree
	 */
	exitTop_col_search_value?: (ctx: Top_col_search_valueContext) => void
	/**
	 * Enter a parse tree produced by the `or_col_expr`
	 * labeled alternative in `SearchGrammarParser.col_expr`.
	 * @param ctx the parse tree
	 */
	enterOr_col_expr?: (ctx: Or_col_exprContext) => void
	/**
	 * Exit a parse tree produced by the `or_col_expr`
	 * labeled alternative in `SearchGrammarParser.col_expr`.
	 * @param ctx the parse tree
	 */
	exitOr_col_expr?: (ctx: Or_col_exprContext) => void
	/**
	 * Enter a parse tree produced by the `col_paren_expr`
	 * labeled alternative in `SearchGrammarParser.col_expr`.
	 * @param ctx the parse tree
	 */
	enterCol_paren_expr?: (ctx: Col_paren_exprContext) => void
	/**
	 * Exit a parse tree produced by the `col_paren_expr`
	 * labeled alternative in `SearchGrammarParser.col_expr`.
	 * @param ctx the parse tree
	 */
	exitCol_paren_expr?: (ctx: Col_paren_exprContext) => void
	/**
	 * Enter a parse tree produced by the `and_col_expr`
	 * labeled alternative in `SearchGrammarParser.col_expr`.
	 * @param ctx the parse tree
	 */
	enterAnd_col_expr?: (ctx: And_col_exprContext) => void
	/**
	 * Exit a parse tree produced by the `and_col_expr`
	 * labeled alternative in `SearchGrammarParser.col_expr`.
	 * @param ctx the parse tree
	 */
	exitAnd_col_expr?: (ctx: And_col_exprContext) => void
	/**
	 * Enter a parse tree produced by the `negated_col_expr`
	 * labeled alternative in `SearchGrammarParser.col_expr`.
	 * @param ctx the parse tree
	 */
	enterNegated_col_expr?: (ctx: Negated_col_exprContext) => void
	/**
	 * Exit a parse tree produced by the `negated_col_expr`
	 * labeled alternative in `SearchGrammarParser.col_expr`.
	 * @param ctx the parse tree
	 */
	exitNegated_col_expr?: (ctx: Negated_col_exprContext) => void
	/**
	 * Enter a parse tree produced by the `col_search_value`
	 * labeled alternative in `SearchGrammarParser.col_expr`.
	 * @param ctx the parse tree
	 */
	enterCol_search_value?: (ctx: Col_search_valueContext) => void
	/**
	 * Exit a parse tree produced by the `col_search_value`
	 * labeled alternative in `SearchGrammarParser.col_expr`.
	 * @param ctx the parse tree
	 */
	exitCol_search_value?: (ctx: Col_search_valueContext) => void
	/**
	 * Enter a parse tree produced by the `negated_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	enterNegated_search_expr?: (ctx: Negated_search_exprContext) => void
	/**
	 * Exit a parse tree produced by the `negated_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	exitNegated_search_expr?: (ctx: Negated_search_exprContext) => void
	/**
	 * Enter a parse tree produced by the `body_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	enterBody_search_expr?: (ctx: Body_search_exprContext) => void
	/**
	 * Exit a parse tree produced by the `body_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	exitBody_search_expr?: (ctx: Body_search_exprContext) => void
	/**
	 * Enter a parse tree produced by the `and_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	enterAnd_search_expr?: (ctx: And_search_exprContext) => void
	/**
	 * Exit a parse tree produced by the `and_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	exitAnd_search_expr?: (ctx: And_search_exprContext) => void
	/**
	 * Enter a parse tree produced by the `or_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	enterOr_search_expr?: (ctx: Or_search_exprContext) => void
	/**
	 * Exit a parse tree produced by the `or_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	exitOr_search_expr?: (ctx: Or_search_exprContext) => void
	/**
	 * Enter a parse tree produced by the `implicit_and_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	enterImplicit_and_search_expr?: (
		ctx: Implicit_and_search_exprContext,
	) => void
	/**
	 * Exit a parse tree produced by the `implicit_and_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	exitImplicit_and_search_expr?: (
		ctx: Implicit_and_search_exprContext,
	) => void
	/**
	 * Enter a parse tree produced by the `exists_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	enterExists_search_expr?: (ctx: Exists_search_exprContext) => void
	/**
	 * Exit a parse tree produced by the `exists_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	exitExists_search_expr?: (ctx: Exists_search_exprContext) => void
	/**
	 * Enter a parse tree produced by the `key_val_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	enterKey_val_search_expr?: (ctx: Key_val_search_exprContext) => void
	/**
	 * Exit a parse tree produced by the `key_val_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	exitKey_val_search_expr?: (ctx: Key_val_search_exprContext) => void
	/**
	 * Enter a parse tree produced by the `paren_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	enterParen_search_expr?: (ctx: Paren_search_exprContext) => void
	/**
	 * Exit a parse tree produced by the `paren_search_expr`
	 * labeled alternative in `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 */
	exitParen_search_expr?: (ctx: Paren_search_exprContext) => void
	/**
	 * Enter a parse tree produced by `SearchGrammarParser.search_key`.
	 * @param ctx the parse tree
	 */
	enterSearch_key?: (ctx: Search_keyContext) => void
	/**
	 * Exit a parse tree produced by `SearchGrammarParser.search_key`.
	 * @param ctx the parse tree
	 */
	exitSearch_key?: (ctx: Search_keyContext) => void
	/**
	 * Enter a parse tree produced by `SearchGrammarParser.and_op`.
	 * @param ctx the parse tree
	 */
	enterAnd_op?: (ctx: And_opContext) => void
	/**
	 * Exit a parse tree produced by `SearchGrammarParser.and_op`.
	 * @param ctx the parse tree
	 */
	exitAnd_op?: (ctx: And_opContext) => void
	/**
	 * Enter a parse tree produced by `SearchGrammarParser.implicit_and_op`.
	 * @param ctx the parse tree
	 */
	enterImplicit_and_op?: (ctx: Implicit_and_opContext) => void
	/**
	 * Exit a parse tree produced by `SearchGrammarParser.implicit_and_op`.
	 * @param ctx the parse tree
	 */
	exitImplicit_and_op?: (ctx: Implicit_and_opContext) => void
	/**
	 * Enter a parse tree produced by `SearchGrammarParser.or_op`.
	 * @param ctx the parse tree
	 */
	enterOr_op?: (ctx: Or_opContext) => void
	/**
	 * Exit a parse tree produced by `SearchGrammarParser.or_op`.
	 * @param ctx the parse tree
	 */
	exitOr_op?: (ctx: Or_opContext) => void
	/**
	 * Enter a parse tree produced by `SearchGrammarParser.exists_op`.
	 * @param ctx the parse tree
	 */
	enterExists_op?: (ctx: Exists_opContext) => void
	/**
	 * Exit a parse tree produced by `SearchGrammarParser.exists_op`.
	 * @param ctx the parse tree
	 */
	exitExists_op?: (ctx: Exists_opContext) => void
	/**
	 * Enter a parse tree produced by `SearchGrammarParser.negation_op`.
	 * @param ctx the parse tree
	 */
	enterNegation_op?: (ctx: Negation_opContext) => void
	/**
	 * Exit a parse tree produced by `SearchGrammarParser.negation_op`.
	 * @param ctx the parse tree
	 */
	exitNegation_op?: (ctx: Negation_opContext) => void
	/**
	 * Enter a parse tree produced by `SearchGrammarParser.bin_op`.
	 * @param ctx the parse tree
	 */
	enterBin_op?: (ctx: Bin_opContext) => void
	/**
	 * Exit a parse tree produced by `SearchGrammarParser.bin_op`.
	 * @param ctx the parse tree
	 */
	exitBin_op?: (ctx: Bin_opContext) => void
	/**
	 * Enter a parse tree produced by `SearchGrammarParser.search_value`.
	 * @param ctx the parse tree
	 */
	enterSearch_value?: (ctx: Search_valueContext) => void
	/**
	 * Exit a parse tree produced by `SearchGrammarParser.search_value`.
	 * @param ctx the parse tree
	 */
	exitSearch_value?: (ctx: Search_valueContext) => void
}
