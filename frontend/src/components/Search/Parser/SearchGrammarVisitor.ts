// Generated from ./src/components/Search/Parser/SearchGrammar.g4 by ANTLR 4.13.1

import { ParseTreeVisitor } from 'antlr4'

import { Search_queryContext } from './SearchGrammarParser'
import { Col_exprContext } from './SearchGrammarParser'
import { Search_exprContext } from './SearchGrammarParser'
import { Search_keyContext } from './SearchGrammarParser'
import { Bin_opContext } from './SearchGrammarParser'
import { SpacesContext } from './SearchGrammarParser'

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `SearchGrammarParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class SearchGrammarVisitor<
	Result,
> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `SearchGrammarParser.search_query`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSearch_query?: (ctx: Search_queryContext) => Result
	/**
	 * Visit a parse tree produced by `SearchGrammarParser.col_expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCol_expr?: (ctx: Col_exprContext) => Result
	/**
	 * Visit a parse tree produced by `SearchGrammarParser.search_expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSearch_expr?: (ctx: Search_exprContext) => Result
	/**
	 * Visit a parse tree produced by `SearchGrammarParser.search_key`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSearch_key?: (ctx: Search_keyContext) => Result
	/**
	 * Visit a parse tree produced by `SearchGrammarParser.bin_op`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBin_op?: (ctx: Bin_opContext) => Result
	/**
	 * Visit a parse tree produced by `SearchGrammarParser.spaces`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSpaces?: (ctx: SpacesContext) => Result
}
