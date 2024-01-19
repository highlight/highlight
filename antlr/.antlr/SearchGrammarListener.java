// Generated from /Users/chris/code/highlight/antlr/SearchGrammar.g4 by ANTLR 4.13.1
import org.antlr.v4.runtime.tree.ParseTreeListener;

/**
 * This interface defines a complete listener for a parse tree produced by
 * {@link SearchGrammarParser}.
 */
public interface SearchGrammarListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by {@link SearchGrammarParser#search_query}.
	 * @param ctx the parse tree
	 */
	void enterSearch_query(SearchGrammarParser.Search_queryContext ctx);
	/**
	 * Exit a parse tree produced by {@link SearchGrammarParser#search_query}.
	 * @param ctx the parse tree
	 */
	void exitSearch_query(SearchGrammarParser.Search_queryContext ctx);
	/**
	 * Enter a parse tree produced by {@link SearchGrammarParser#col_expr}.
	 * @param ctx the parse tree
	 */
	void enterCol_expr(SearchGrammarParser.Col_exprContext ctx);
	/**
	 * Exit a parse tree produced by {@link SearchGrammarParser#col_expr}.
	 * @param ctx the parse tree
	 */
	void exitCol_expr(SearchGrammarParser.Col_exprContext ctx);
	/**
	 * Enter a parse tree produced by {@link SearchGrammarParser#search_expr}.
	 * @param ctx the parse tree
	 */
	void enterSearch_expr(SearchGrammarParser.Search_exprContext ctx);
	/**
	 * Exit a parse tree produced by {@link SearchGrammarParser#search_expr}.
	 * @param ctx the parse tree
	 */
	void exitSearch_expr(SearchGrammarParser.Search_exprContext ctx);
	/**
	 * Enter a parse tree produced by {@link SearchGrammarParser#search_key}.
	 * @param ctx the parse tree
	 */
	void enterSearch_key(SearchGrammarParser.Search_keyContext ctx);
	/**
	 * Exit a parse tree produced by {@link SearchGrammarParser#search_key}.
	 * @param ctx the parse tree
	 */
	void exitSearch_key(SearchGrammarParser.Search_keyContext ctx);
	/**
	 * Enter a parse tree produced by {@link SearchGrammarParser#bin_op}.
	 * @param ctx the parse tree
	 */
	void enterBin_op(SearchGrammarParser.Bin_opContext ctx);
	/**
	 * Exit a parse tree produced by {@link SearchGrammarParser#bin_op}.
	 * @param ctx the parse tree
	 */
	void exitBin_op(SearchGrammarParser.Bin_opContext ctx);
}