// Generated from /Users/chris/code/highlight/antlr/SearchGrammar.g4 by ANTLR 4.13.1
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.*;
import org.antlr.v4.runtime.tree.*;
import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast", "CheckReturnValue"})
public class SearchGrammarParser extends Parser {
	static { RuntimeMetaData.checkVersion("4.13.1", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		AND=1, OR=2, NOT=3, EQ=4, NEQ=5, LT=6, LTE=7, GT=8, GTE=9, LPAREN=10, 
		RPAREN=11, COLON=12, ID=13, STRING=14, WS=15, ERROR_CHAR=16;
	public static final int
		RULE_search_query = 0, RULE_top_col_expr = 1, RULE_col_expr = 2, RULE_search_expr = 3, 
		RULE_search_key = 4, RULE_and_op = 5, RULE_or_op = 6, RULE_negation_op = 7, 
		RULE_bin_op = 8, RULE_search_value = 9;
	private static String[] makeRuleNames() {
		return new String[] {
			"search_query", "top_col_expr", "col_expr", "search_expr", "search_key", 
			"and_op", "or_op", "negation_op", "bin_op", "search_value"
		};
	}
	public static final String[] ruleNames = makeRuleNames();

	private static String[] makeLiteralNames() {
		return new String[] {
			null, "'AND'", "'OR'", "'NOT'", "'='", "'!='", "'<'", "'<='", "'>'", 
			"'>='", "'('", "')'", "':'"
		};
	}
	private static final String[] _LITERAL_NAMES = makeLiteralNames();
	private static String[] makeSymbolicNames() {
		return new String[] {
			null, "AND", "OR", "NOT", "EQ", "NEQ", "LT", "LTE", "GT", "GTE", "LPAREN", 
			"RPAREN", "COLON", "ID", "STRING", "WS", "ERROR_CHAR"
		};
	}
	private static final String[] _SYMBOLIC_NAMES = makeSymbolicNames();
	public static final Vocabulary VOCABULARY = new VocabularyImpl(_LITERAL_NAMES, _SYMBOLIC_NAMES);

	/**
	 * @deprecated Use {@link #VOCABULARY} instead.
	 */
	@Deprecated
	public static final String[] tokenNames;
	static {
		tokenNames = new String[_SYMBOLIC_NAMES.length];
		for (int i = 0; i < tokenNames.length; i++) {
			tokenNames[i] = VOCABULARY.getLiteralName(i);
			if (tokenNames[i] == null) {
				tokenNames[i] = VOCABULARY.getSymbolicName(i);
			}

			if (tokenNames[i] == null) {
				tokenNames[i] = "<INVALID>";
			}
		}
	}

	@Override
	@Deprecated
	public String[] getTokenNames() {
		return tokenNames;
	}

	@Override

	public Vocabulary getVocabulary() {
		return VOCABULARY;
	}

	@Override
	public String getGrammarFileName() { return "SearchGrammar.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public ATN getATN() { return _ATN; }

	public SearchGrammarParser(TokenStream input) {
		super(input);
		_interp = new ParserATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Search_queryContext extends ParserRuleContext {
		public TerminalNode EOF() { return getToken(SearchGrammarParser.EOF, 0); }
		public Search_exprContext search_expr() {
			return getRuleContext(Search_exprContext.class,0);
		}
		public Search_queryContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_search_query; }
	}

	public final Search_queryContext search_query() throws RecognitionException {
		Search_queryContext _localctx = new Search_queryContext(_ctx, getState());
		enterRule(_localctx, 0, RULE_search_query);
		try {
			setState(24);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case EOF:
				enterOuterAlt(_localctx, 1);
				{
				setState(20);
				match(EOF);
				}
				break;
			case NOT:
			case LPAREN:
			case ID:
			case STRING:
				enterOuterAlt(_localctx, 2);
				{
				setState(21);
				search_expr(0);
				setState(22);
				match(EOF);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Top_col_exprContext extends ParserRuleContext {
		public Top_col_exprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_top_col_expr; }
	 
		public Top_col_exprContext() { }
		public void copyFrom(Top_col_exprContext ctx) {
			super.copyFrom(ctx);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Negated_top_col_exprContext extends Top_col_exprContext {
		public Negation_opContext negation_op() {
			return getRuleContext(Negation_opContext.class,0);
		}
		public Top_col_exprContext top_col_expr() {
			return getRuleContext(Top_col_exprContext.class,0);
		}
		public Negated_top_col_exprContext(Top_col_exprContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Top_paren_col_exprContext extends Top_col_exprContext {
		public TerminalNode LPAREN() { return getToken(SearchGrammarParser.LPAREN, 0); }
		public Col_exprContext col_expr() {
			return getRuleContext(Col_exprContext.class,0);
		}
		public TerminalNode RPAREN() { return getToken(SearchGrammarParser.RPAREN, 0); }
		public Top_paren_col_exprContext(Top_col_exprContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Top_col_search_valueContext extends Top_col_exprContext {
		public Search_valueContext search_value() {
			return getRuleContext(Search_valueContext.class,0);
		}
		public Top_col_search_valueContext(Top_col_exprContext ctx) { copyFrom(ctx); }
	}

	public final Top_col_exprContext top_col_expr() throws RecognitionException {
		Top_col_exprContext _localctx = new Top_col_exprContext(_ctx, getState());
		enterRule(_localctx, 2, RULE_top_col_expr);
		try {
			setState(34);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case LPAREN:
				_localctx = new Top_paren_col_exprContext(_localctx);
				enterOuterAlt(_localctx, 1);
				{
				setState(26);
				match(LPAREN);
				setState(27);
				col_expr(0);
				setState(28);
				match(RPAREN);
				}
				break;
			case NOT:
				_localctx = new Negated_top_col_exprContext(_localctx);
				enterOuterAlt(_localctx, 2);
				{
				setState(30);
				negation_op();
				setState(31);
				top_col_expr();
				}
				break;
			case ID:
			case STRING:
				_localctx = new Top_col_search_valueContext(_localctx);
				enterOuterAlt(_localctx, 3);
				{
				setState(33);
				search_value();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Col_exprContext extends ParserRuleContext {
		public Col_exprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_col_expr; }
	 
		public Col_exprContext() { }
		public void copyFrom(Col_exprContext ctx) {
			super.copyFrom(ctx);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Or_col_exprContext extends Col_exprContext {
		public List<Col_exprContext> col_expr() {
			return getRuleContexts(Col_exprContext.class);
		}
		public Col_exprContext col_expr(int i) {
			return getRuleContext(Col_exprContext.class,i);
		}
		public TerminalNode OR() { return getToken(SearchGrammarParser.OR, 0); }
		public Or_col_exprContext(Col_exprContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Col_paren_exprContext extends Col_exprContext {
		public TerminalNode LPAREN() { return getToken(SearchGrammarParser.LPAREN, 0); }
		public Col_exprContext col_expr() {
			return getRuleContext(Col_exprContext.class,0);
		}
		public TerminalNode RPAREN() { return getToken(SearchGrammarParser.RPAREN, 0); }
		public Col_paren_exprContext(Col_exprContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class And_col_exprContext extends Col_exprContext {
		public List<Col_exprContext> col_expr() {
			return getRuleContexts(Col_exprContext.class);
		}
		public Col_exprContext col_expr(int i) {
			return getRuleContext(Col_exprContext.class,i);
		}
		public And_opContext and_op() {
			return getRuleContext(And_opContext.class,0);
		}
		public And_col_exprContext(Col_exprContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Negated_col_exprContext extends Col_exprContext {
		public Negation_opContext negation_op() {
			return getRuleContext(Negation_opContext.class,0);
		}
		public Col_exprContext col_expr() {
			return getRuleContext(Col_exprContext.class,0);
		}
		public Negated_col_exprContext(Col_exprContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Col_search_valueContext extends Col_exprContext {
		public Search_valueContext search_value() {
			return getRuleContext(Search_valueContext.class,0);
		}
		public Col_search_valueContext(Col_exprContext ctx) { copyFrom(ctx); }
	}

	public final Col_exprContext col_expr() throws RecognitionException {
		return col_expr(0);
	}

	private Col_exprContext col_expr(int _p) throws RecognitionException {
		ParserRuleContext _parentctx = _ctx;
		int _parentState = getState();
		Col_exprContext _localctx = new Col_exprContext(_ctx, _parentState);
		Col_exprContext _prevctx = _localctx;
		int _startState = 4;
		enterRecursionRule(_localctx, 4, RULE_col_expr, _p);
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(45);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case LPAREN:
				{
				_localctx = new Col_paren_exprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;

				setState(37);
				match(LPAREN);
				setState(38);
				col_expr(0);
				setState(39);
				match(RPAREN);
				}
				break;
			case NOT:
				{
				_localctx = new Negated_col_exprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(41);
				negation_op();
				setState(42);
				col_expr(4);
				}
				break;
			case ID:
			case STRING:
				{
				_localctx = new Col_search_valueContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(44);
				search_value();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			_ctx.stop = _input.LT(-1);
			setState(56);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,4,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(54);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,3,_ctx) ) {
					case 1:
						{
						_localctx = new And_col_exprContext(new Col_exprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_col_expr);
						setState(47);
						if (!(precpred(_ctx, 3))) throw new FailedPredicateException(this, "precpred(_ctx, 3)");
						setState(48);
						and_op();
						setState(49);
						col_expr(4);
						}
						break;
					case 2:
						{
						_localctx = new Or_col_exprContext(new Col_exprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_col_expr);
						setState(51);
						if (!(precpred(_ctx, 2))) throw new FailedPredicateException(this, "precpred(_ctx, 2)");
						setState(52);
						match(OR);
						setState(53);
						col_expr(3);
						}
						break;
					}
					} 
				}
				setState(58);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,4,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Search_exprContext extends ParserRuleContext {
		public Search_exprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_search_expr; }
	 
		public Search_exprContext() { }
		public void copyFrom(Search_exprContext ctx) {
			super.copyFrom(ctx);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Negated_search_exprContext extends Search_exprContext {
		public Negation_opContext negation_op() {
			return getRuleContext(Negation_opContext.class,0);
		}
		public Search_exprContext search_expr() {
			return getRuleContext(Search_exprContext.class,0);
		}
		public Negated_search_exprContext(Search_exprContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Body_search_exprContext extends Search_exprContext {
		public Top_col_exprContext top_col_expr() {
			return getRuleContext(Top_col_exprContext.class,0);
		}
		public Body_search_exprContext(Search_exprContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class And_search_exprContext extends Search_exprContext {
		public List<Search_exprContext> search_expr() {
			return getRuleContexts(Search_exprContext.class);
		}
		public Search_exprContext search_expr(int i) {
			return getRuleContext(Search_exprContext.class,i);
		}
		public And_opContext and_op() {
			return getRuleContext(And_opContext.class,0);
		}
		public And_search_exprContext(Search_exprContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Or_search_exprContext extends Search_exprContext {
		public List<Search_exprContext> search_expr() {
			return getRuleContexts(Search_exprContext.class);
		}
		public Search_exprContext search_expr(int i) {
			return getRuleContext(Search_exprContext.class,i);
		}
		public TerminalNode OR() { return getToken(SearchGrammarParser.OR, 0); }
		public Or_search_exprContext(Search_exprContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Key_val_search_exprContext extends Search_exprContext {
		public Search_keyContext search_key() {
			return getRuleContext(Search_keyContext.class,0);
		}
		public Bin_opContext bin_op() {
			return getRuleContext(Bin_opContext.class,0);
		}
		public Top_col_exprContext top_col_expr() {
			return getRuleContext(Top_col_exprContext.class,0);
		}
		public Key_val_search_exprContext(Search_exprContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Paren_search_exprContext extends Search_exprContext {
		public TerminalNode LPAREN() { return getToken(SearchGrammarParser.LPAREN, 0); }
		public Search_exprContext search_expr() {
			return getRuleContext(Search_exprContext.class,0);
		}
		public TerminalNode RPAREN() { return getToken(SearchGrammarParser.RPAREN, 0); }
		public Paren_search_exprContext(Search_exprContext ctx) { copyFrom(ctx); }
	}

	public final Search_exprContext search_expr() throws RecognitionException {
		return search_expr(0);
	}

	private Search_exprContext search_expr(int _p) throws RecognitionException {
		ParserRuleContext _parentctx = _ctx;
		int _parentState = getState();
		Search_exprContext _localctx = new Search_exprContext(_ctx, _parentState);
		Search_exprContext _prevctx = _localctx;
		int _startState = 6;
		enterRecursionRule(_localctx, 6, RULE_search_expr, _p);
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(72);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,5,_ctx) ) {
			case 1:
				{
				_localctx = new Paren_search_exprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;

				setState(60);
				match(LPAREN);
				setState(61);
				search_expr(0);
				setState(62);
				match(RPAREN);
				}
				break;
			case 2:
				{
				_localctx = new Negated_search_exprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(64);
				negation_op();
				setState(65);
				search_expr(5);
				}
				break;
			case 3:
				{
				_localctx = new Key_val_search_exprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(67);
				search_key();
				setState(68);
				bin_op();
				setState(69);
				top_col_expr();
				}
				break;
			case 4:
				{
				_localctx = new Body_search_exprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(71);
				top_col_expr();
				}
				break;
			}
			_ctx.stop = _input.LT(-1);
			setState(83);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,7,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(81);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,6,_ctx) ) {
					case 1:
						{
						_localctx = new And_search_exprContext(new Search_exprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_search_expr);
						setState(74);
						if (!(precpred(_ctx, 4))) throw new FailedPredicateException(this, "precpred(_ctx, 4)");
						setState(75);
						and_op();
						setState(76);
						search_expr(5);
						}
						break;
					case 2:
						{
						_localctx = new Or_search_exprContext(new Search_exprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_search_expr);
						setState(78);
						if (!(precpred(_ctx, 3))) throw new FailedPredicateException(this, "precpred(_ctx, 3)");
						setState(79);
						match(OR);
						setState(80);
						search_expr(4);
						}
						break;
					}
					} 
				}
				setState(85);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,7,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Search_keyContext extends ParserRuleContext {
		public TerminalNode ID() { return getToken(SearchGrammarParser.ID, 0); }
		public Search_keyContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_search_key; }
	}

	public final Search_keyContext search_key() throws RecognitionException {
		Search_keyContext _localctx = new Search_keyContext(_ctx, getState());
		enterRule(_localctx, 8, RULE_search_key);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(86);
			match(ID);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class And_opContext extends ParserRuleContext {
		public TerminalNode AND() { return getToken(SearchGrammarParser.AND, 0); }
		public And_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_and_op; }
	}

	public final And_opContext and_op() throws RecognitionException {
		And_opContext _localctx = new And_opContext(_ctx, getState());
		enterRule(_localctx, 10, RULE_and_op);
		try {
			setState(90);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case AND:
				enterOuterAlt(_localctx, 1);
				{
				setState(88);
				match(AND);
				}
				break;
			case NOT:
			case LPAREN:
			case ID:
			case STRING:
				enterOuterAlt(_localctx, 2);
				{
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Or_opContext extends ParserRuleContext {
		public TerminalNode OR() { return getToken(SearchGrammarParser.OR, 0); }
		public Or_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_or_op; }
	}

	public final Or_opContext or_op() throws RecognitionException {
		Or_opContext _localctx = new Or_opContext(_ctx, getState());
		enterRule(_localctx, 12, RULE_or_op);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(92);
			match(OR);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Negation_opContext extends ParserRuleContext {
		public TerminalNode NOT() { return getToken(SearchGrammarParser.NOT, 0); }
		public Negation_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_negation_op; }
	}

	public final Negation_opContext negation_op() throws RecognitionException {
		Negation_opContext _localctx = new Negation_opContext(_ctx, getState());
		enterRule(_localctx, 14, RULE_negation_op);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(94);
			match(NOT);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Bin_opContext extends ParserRuleContext {
		public TerminalNode EQ() { return getToken(SearchGrammarParser.EQ, 0); }
		public TerminalNode NEQ() { return getToken(SearchGrammarParser.NEQ, 0); }
		public TerminalNode GT() { return getToken(SearchGrammarParser.GT, 0); }
		public TerminalNode GTE() { return getToken(SearchGrammarParser.GTE, 0); }
		public TerminalNode LT() { return getToken(SearchGrammarParser.LT, 0); }
		public TerminalNode LTE() { return getToken(SearchGrammarParser.LTE, 0); }
		public TerminalNode COLON() { return getToken(SearchGrammarParser.COLON, 0); }
		public Bin_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_bin_op; }
	}

	public final Bin_opContext bin_op() throws RecognitionException {
		Bin_opContext _localctx = new Bin_opContext(_ctx, getState());
		enterRule(_localctx, 16, RULE_bin_op);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(96);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 5104L) != 0)) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class Search_valueContext extends ParserRuleContext {
		public Search_valueContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_search_value; }
	 
		public Search_valueContext() { }
		public void copyFrom(Search_valueContext ctx) {
			super.copyFrom(ctx);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class String_search_valueContext extends Search_valueContext {
		public TerminalNode STRING() { return getToken(SearchGrammarParser.STRING, 0); }
		public String_search_valueContext(Search_valueContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Id_search_valueContext extends Search_valueContext {
		public TerminalNode ID() { return getToken(SearchGrammarParser.ID, 0); }
		public Id_search_valueContext(Search_valueContext ctx) { copyFrom(ctx); }
	}

	public final Search_valueContext search_value() throws RecognitionException {
		Search_valueContext _localctx = new Search_valueContext(_ctx, getState());
		enterRule(_localctx, 18, RULE_search_value);
		try {
			setState(100);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case ID:
				_localctx = new Id_search_valueContext(_localctx);
				enterOuterAlt(_localctx, 1);
				{
				setState(98);
				match(ID);
				}
				break;
			case STRING:
				_localctx = new String_search_valueContext(_localctx);
				enterOuterAlt(_localctx, 2);
				{
				setState(99);
				match(STRING);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public boolean sempred(RuleContext _localctx, int ruleIndex, int predIndex) {
		switch (ruleIndex) {
		case 2:
			return col_expr_sempred((Col_exprContext)_localctx, predIndex);
		case 3:
			return search_expr_sempred((Search_exprContext)_localctx, predIndex);
		}
		return true;
	}
	private boolean col_expr_sempred(Col_exprContext _localctx, int predIndex) {
		switch (predIndex) {
		case 0:
			return precpred(_ctx, 3);
		case 1:
			return precpred(_ctx, 2);
		}
		return true;
	}
	private boolean search_expr_sempred(Search_exprContext _localctx, int predIndex) {
		switch (predIndex) {
		case 2:
			return precpred(_ctx, 4);
		case 3:
			return precpred(_ctx, 3);
		}
		return true;
	}

	public static final String _serializedATN =
		"\u0004\u0001\u0010g\u0002\u0000\u0007\u0000\u0002\u0001\u0007\u0001\u0002"+
		"\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002\u0004\u0007\u0004\u0002"+
		"\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0002\u0007\u0007\u0007\u0002"+
		"\b\u0007\b\u0002\t\u0007\t\u0001\u0000\u0001\u0000\u0001\u0000\u0001\u0000"+
		"\u0003\u0000\u0019\b\u0000\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001"+
		"\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0003\u0001#\b\u0001"+
		"\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002"+
		"\u0001\u0002\u0001\u0002\u0001\u0002\u0003\u0002.\b\u0002\u0001\u0002"+
		"\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002"+
		"\u0005\u00027\b\u0002\n\u0002\f\u0002:\t\u0002\u0001\u0003\u0001\u0003"+
		"\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003"+
		"\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0003\u0003"+
		"I\b\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003"+
		"\u0001\u0003\u0001\u0003\u0005\u0003R\b\u0003\n\u0003\f\u0003U\t\u0003"+
		"\u0001\u0004\u0001\u0004\u0001\u0005\u0001\u0005\u0003\u0005[\b\u0005"+
		"\u0001\u0006\u0001\u0006\u0001\u0007\u0001\u0007\u0001\b\u0001\b\u0001"+
		"\t\u0001\t\u0003\te\b\t\u0001\t\u0000\u0002\u0004\u0006\n\u0000\u0002"+
		"\u0004\u0006\b\n\f\u000e\u0010\u0012\u0000\u0001\u0002\u0000\u0004\t\f"+
		"\fj\u0000\u0018\u0001\u0000\u0000\u0000\u0002\"\u0001\u0000\u0000\u0000"+
		"\u0004-\u0001\u0000\u0000\u0000\u0006H\u0001\u0000\u0000\u0000\bV\u0001"+
		"\u0000\u0000\u0000\nZ\u0001\u0000\u0000\u0000\f\\\u0001\u0000\u0000\u0000"+
		"\u000e^\u0001\u0000\u0000\u0000\u0010`\u0001\u0000\u0000\u0000\u0012d"+
		"\u0001\u0000\u0000\u0000\u0014\u0019\u0005\u0000\u0000\u0001\u0015\u0016"+
		"\u0003\u0006\u0003\u0000\u0016\u0017\u0005\u0000\u0000\u0001\u0017\u0019"+
		"\u0001\u0000\u0000\u0000\u0018\u0014\u0001\u0000\u0000\u0000\u0018\u0015"+
		"\u0001\u0000\u0000\u0000\u0019\u0001\u0001\u0000\u0000\u0000\u001a\u001b"+
		"\u0005\n\u0000\u0000\u001b\u001c\u0003\u0004\u0002\u0000\u001c\u001d\u0005"+
		"\u000b\u0000\u0000\u001d#\u0001\u0000\u0000\u0000\u001e\u001f\u0003\u000e"+
		"\u0007\u0000\u001f \u0003\u0002\u0001\u0000 #\u0001\u0000\u0000\u0000"+
		"!#\u0003\u0012\t\u0000\"\u001a\u0001\u0000\u0000\u0000\"\u001e\u0001\u0000"+
		"\u0000\u0000\"!\u0001\u0000\u0000\u0000#\u0003\u0001\u0000\u0000\u0000"+
		"$%\u0006\u0002\uffff\uffff\u0000%&\u0005\n\u0000\u0000&\'\u0003\u0004"+
		"\u0002\u0000\'(\u0005\u000b\u0000\u0000(.\u0001\u0000\u0000\u0000)*\u0003"+
		"\u000e\u0007\u0000*+\u0003\u0004\u0002\u0004+.\u0001\u0000\u0000\u0000"+
		",.\u0003\u0012\t\u0000-$\u0001\u0000\u0000\u0000-)\u0001\u0000\u0000\u0000"+
		"-,\u0001\u0000\u0000\u0000.8\u0001\u0000\u0000\u0000/0\n\u0003\u0000\u0000"+
		"01\u0003\n\u0005\u000012\u0003\u0004\u0002\u000427\u0001\u0000\u0000\u0000"+
		"34\n\u0002\u0000\u000045\u0005\u0002\u0000\u000057\u0003\u0004\u0002\u0003"+
		"6/\u0001\u0000\u0000\u000063\u0001\u0000\u0000\u00007:\u0001\u0000\u0000"+
		"\u000086\u0001\u0000\u0000\u000089\u0001\u0000\u0000\u00009\u0005\u0001"+
		"\u0000\u0000\u0000:8\u0001\u0000\u0000\u0000;<\u0006\u0003\uffff\uffff"+
		"\u0000<=\u0005\n\u0000\u0000=>\u0003\u0006\u0003\u0000>?\u0005\u000b\u0000"+
		"\u0000?I\u0001\u0000\u0000\u0000@A\u0003\u000e\u0007\u0000AB\u0003\u0006"+
		"\u0003\u0005BI\u0001\u0000\u0000\u0000CD\u0003\b\u0004\u0000DE\u0003\u0010"+
		"\b\u0000EF\u0003\u0002\u0001\u0000FI\u0001\u0000\u0000\u0000GI\u0003\u0002"+
		"\u0001\u0000H;\u0001\u0000\u0000\u0000H@\u0001\u0000\u0000\u0000HC\u0001"+
		"\u0000\u0000\u0000HG\u0001\u0000\u0000\u0000IS\u0001\u0000\u0000\u0000"+
		"JK\n\u0004\u0000\u0000KL\u0003\n\u0005\u0000LM\u0003\u0006\u0003\u0005"+
		"MR\u0001\u0000\u0000\u0000NO\n\u0003\u0000\u0000OP\u0005\u0002\u0000\u0000"+
		"PR\u0003\u0006\u0003\u0004QJ\u0001\u0000\u0000\u0000QN\u0001\u0000\u0000"+
		"\u0000RU\u0001\u0000\u0000\u0000SQ\u0001\u0000\u0000\u0000ST\u0001\u0000"+
		"\u0000\u0000T\u0007\u0001\u0000\u0000\u0000US\u0001\u0000\u0000\u0000"+
		"VW\u0005\r\u0000\u0000W\t\u0001\u0000\u0000\u0000X[\u0005\u0001\u0000"+
		"\u0000Y[\u0001\u0000\u0000\u0000ZX\u0001\u0000\u0000\u0000ZY\u0001\u0000"+
		"\u0000\u0000[\u000b\u0001\u0000\u0000\u0000\\]\u0005\u0002\u0000\u0000"+
		"]\r\u0001\u0000\u0000\u0000^_\u0005\u0003\u0000\u0000_\u000f\u0001\u0000"+
		"\u0000\u0000`a\u0007\u0000\u0000\u0000a\u0011\u0001\u0000\u0000\u0000"+
		"be\u0005\r\u0000\u0000ce\u0005\u000e\u0000\u0000db\u0001\u0000\u0000\u0000"+
		"dc\u0001\u0000\u0000\u0000e\u0013\u0001\u0000\u0000\u0000\n\u0018\"-6"+
		"8HQSZd";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}