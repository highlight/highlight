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
		AND=1, OR=2, NOT=3, BANG=4, EQ=5, NEQ=6, LT=7, LTE=8, GT=9, GTE=10, LPAREN=11, 
		RPAREN=12, COLON=13, ID=14, STRING=15, VALUE=16, WS=17, ERROR_CHARACTERS=18;
	public static final int
		RULE_search_query = 0, RULE_top_col_expr = 1, RULE_col_expr = 2, RULE_search_expr = 3, 
		RULE_search_key = 4, RULE_and_op = 5, RULE_implicit_and_op = 6, RULE_or_op = 7, 
		RULE_negation_op = 8, RULE_bin_op = 9, RULE_search_value = 10;
	private static String[] makeRuleNames() {
		return new String[] {
			"search_query", "top_col_expr", "col_expr", "search_expr", "search_key", 
			"and_op", "implicit_and_op", "or_op", "negation_op", "bin_op", "search_value"
		};
	}
	public static final String[] ruleNames = makeRuleNames();

	private static String[] makeLiteralNames() {
		return new String[] {
			null, "'AND'", "'OR'", "'NOT'", "'!'", "'='", "'!='", "'<'", "'<='", 
			"'>'", "'>='", "'('", "')'", "':'"
		};
	}
	private static final String[] _LITERAL_NAMES = makeLiteralNames();
	private static String[] makeSymbolicNames() {
		return new String[] {
			null, "AND", "OR", "NOT", "BANG", "EQ", "NEQ", "LT", "LTE", "GT", "GTE", 
			"LPAREN", "RPAREN", "COLON", "ID", "STRING", "VALUE", "WS", "ERROR_CHARACTERS"
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
			setState(26);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case EOF:
				enterOuterAlt(_localctx, 1);
				{
				setState(22);
				match(EOF);
				}
				break;
			case NOT:
			case LPAREN:
			case ID:
			case STRING:
			case VALUE:
				enterOuterAlt(_localctx, 2);
				{
				setState(23);
				search_expr(0);
				setState(24);
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
			setState(36);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case LPAREN:
				_localctx = new Top_paren_col_exprContext(_localctx);
				enterOuterAlt(_localctx, 1);
				{
				setState(28);
				match(LPAREN);
				setState(29);
				col_expr(0);
				setState(30);
				match(RPAREN);
				}
				break;
			case NOT:
				_localctx = new Negated_top_col_exprContext(_localctx);
				enterOuterAlt(_localctx, 2);
				{
				setState(32);
				negation_op();
				setState(33);
				top_col_expr();
				}
				break;
			case ID:
			case STRING:
			case VALUE:
				_localctx = new Top_col_search_valueContext(_localctx);
				enterOuterAlt(_localctx, 3);
				{
				setState(35);
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
			setState(47);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case LPAREN:
				{
				_localctx = new Col_paren_exprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;

				setState(39);
				match(LPAREN);
				setState(40);
				col_expr(0);
				setState(41);
				match(RPAREN);
				}
				break;
			case NOT:
				{
				_localctx = new Negated_col_exprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(43);
				negation_op();
				setState(44);
				col_expr(4);
				}
				break;
			case ID:
			case STRING:
			case VALUE:
				{
				_localctx = new Col_search_valueContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(46);
				search_value();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			_ctx.stop = _input.LT(-1);
			setState(58);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,4,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(56);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,3,_ctx) ) {
					case 1:
						{
						_localctx = new And_col_exprContext(new Col_exprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_col_expr);
						setState(49);
						if (!(precpred(_ctx, 3))) throw new FailedPredicateException(this, "precpred(_ctx, 3)");
						setState(50);
						and_op();
						setState(51);
						col_expr(4);
						}
						break;
					case 2:
						{
						_localctx = new Or_col_exprContext(new Col_exprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_col_expr);
						setState(53);
						if (!(precpred(_ctx, 2))) throw new FailedPredicateException(this, "precpred(_ctx, 2)");
						setState(54);
						match(OR);
						setState(55);
						col_expr(3);
						}
						break;
					}
					} 
				}
				setState(60);
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
		public Or_opContext or_op() {
			return getRuleContext(Or_opContext.class,0);
		}
		public Or_search_exprContext(Search_exprContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class Implicit_and_search_exprContext extends Search_exprContext {
		public List<Search_exprContext> search_expr() {
			return getRuleContexts(Search_exprContext.class);
		}
		public Search_exprContext search_expr(int i) {
			return getRuleContext(Search_exprContext.class,i);
		}
		public Implicit_and_opContext implicit_and_op() {
			return getRuleContext(Implicit_and_opContext.class,0);
		}
		public Implicit_and_search_exprContext(Search_exprContext ctx) { copyFrom(ctx); }
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
			setState(74);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,5,_ctx) ) {
			case 1:
				{
				_localctx = new Paren_search_exprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;

				setState(62);
				match(LPAREN);
				setState(63);
				search_expr(0);
				setState(64);
				match(RPAREN);
				}
				break;
			case 2:
				{
				_localctx = new Negated_search_exprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(66);
				negation_op();
				setState(67);
				search_expr(6);
				}
				break;
			case 3:
				{
				_localctx = new Key_val_search_exprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(69);
				search_key();
				setState(70);
				bin_op();
				setState(71);
				top_col_expr();
				}
				break;
			case 4:
				{
				_localctx = new Body_search_exprContext(_localctx);
				_ctx = _localctx;
				_prevctx = _localctx;
				setState(73);
				top_col_expr();
				}
				break;
			}
			_ctx.stop = _input.LT(-1);
			setState(90);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,7,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(88);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,6,_ctx) ) {
					case 1:
						{
						_localctx = new And_search_exprContext(new Search_exprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_search_expr);
						setState(76);
						if (!(precpred(_ctx, 5))) throw new FailedPredicateException(this, "precpred(_ctx, 5)");
						setState(77);
						and_op();
						setState(78);
						search_expr(6);
						}
						break;
					case 2:
						{
						_localctx = new Or_search_exprContext(new Search_exprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_search_expr);
						setState(80);
						if (!(precpred(_ctx, 4))) throw new FailedPredicateException(this, "precpred(_ctx, 4)");
						setState(81);
						or_op();
						setState(82);
						search_expr(5);
						}
						break;
					case 3:
						{
						_localctx = new Implicit_and_search_exprContext(new Search_exprContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_search_expr);
						setState(84);
						if (!(precpred(_ctx, 3))) throw new FailedPredicateException(this, "precpred(_ctx, 3)");
						setState(85);
						implicit_and_op();
						setState(86);
						search_expr(4);
						}
						break;
					}
					} 
				}
				setState(92);
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
			setState(93);
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
			enterOuterAlt(_localctx, 1);
			{
			setState(95);
			match(AND);
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
	public static class Implicit_and_opContext extends ParserRuleContext {
		public Implicit_and_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_implicit_and_op; }
	}

	public final Implicit_and_opContext implicit_and_op() throws RecognitionException {
		Implicit_and_opContext _localctx = new Implicit_and_opContext(_ctx, getState());
		enterRule(_localctx, 12, RULE_implicit_and_op);
		try {
			enterOuterAlt(_localctx, 1);
			{
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
		enterRule(_localctx, 14, RULE_or_op);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(99);
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
		enterRule(_localctx, 16, RULE_negation_op);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(101);
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
		public TerminalNode BANG() { return getToken(SearchGrammarParser.BANG, 0); }
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
		enterRule(_localctx, 18, RULE_bin_op);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(103);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 10224L) != 0)) ) {
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
		public TerminalNode STRING() { return getToken(SearchGrammarParser.STRING, 0); }
		public TerminalNode ID() { return getToken(SearchGrammarParser.ID, 0); }
		public TerminalNode VALUE() { return getToken(SearchGrammarParser.VALUE, 0); }
		public Search_valueContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_search_value; }
	}

	public final Search_valueContext search_value() throws RecognitionException {
		Search_valueContext _localctx = new Search_valueContext(_ctx, getState());
		enterRule(_localctx, 20, RULE_search_value);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(105);
			_la = _input.LA(1);
			if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 114688L) != 0)) ) {
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
			return precpred(_ctx, 5);
		case 3:
			return precpred(_ctx, 4);
		case 4:
			return precpred(_ctx, 3);
		}
		return true;
	}

	public static final String _serializedATN =
		"\u0004\u0001\u0012l\u0002\u0000\u0007\u0000\u0002\u0001\u0007\u0001\u0002"+
		"\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002\u0004\u0007\u0004\u0002"+
		"\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0002\u0007\u0007\u0007\u0002"+
		"\b\u0007\b\u0002\t\u0007\t\u0002\n\u0007\n\u0001\u0000\u0001\u0000\u0001"+
		"\u0000\u0001\u0000\u0003\u0000\u001b\b\u0000\u0001\u0001\u0001\u0001\u0001"+
		"\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0003"+
		"\u0001%\b\u0001\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001"+
		"\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0003\u00020\b"+
		"\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001"+
		"\u0002\u0001\u0002\u0005\u00029\b\u0002\n\u0002\f\u0002<\t\u0002\u0001"+
		"\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001"+
		"\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001"+
		"\u0003\u0003\u0003K\b\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001"+
		"\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001\u0003\u0001"+
		"\u0003\u0001\u0003\u0001\u0003\u0005\u0003Y\b\u0003\n\u0003\f\u0003\\"+
		"\t\u0003\u0001\u0004\u0001\u0004\u0001\u0005\u0001\u0005\u0001\u0006\u0001"+
		"\u0006\u0001\u0007\u0001\u0007\u0001\b\u0001\b\u0001\t\u0001\t\u0001\n"+
		"\u0001\n\u0001\n\u0000\u0002\u0004\u0006\u000b\u0000\u0002\u0004\u0006"+
		"\b\n\f\u000e\u0010\u0012\u0014\u0000\u0002\u0002\u0000\u0004\n\r\r\u0001"+
		"\u0000\u000e\u0010m\u0000\u001a\u0001\u0000\u0000\u0000\u0002$\u0001\u0000"+
		"\u0000\u0000\u0004/\u0001\u0000\u0000\u0000\u0006J\u0001\u0000\u0000\u0000"+
		"\b]\u0001\u0000\u0000\u0000\n_\u0001\u0000\u0000\u0000\fa\u0001\u0000"+
		"\u0000\u0000\u000ec\u0001\u0000\u0000\u0000\u0010e\u0001\u0000\u0000\u0000"+
		"\u0012g\u0001\u0000\u0000\u0000\u0014i\u0001\u0000\u0000\u0000\u0016\u001b"+
		"\u0005\u0000\u0000\u0001\u0017\u0018\u0003\u0006\u0003\u0000\u0018\u0019"+
		"\u0005\u0000\u0000\u0001\u0019\u001b\u0001\u0000\u0000\u0000\u001a\u0016"+
		"\u0001\u0000\u0000\u0000\u001a\u0017\u0001\u0000\u0000\u0000\u001b\u0001"+
		"\u0001\u0000\u0000\u0000\u001c\u001d\u0005\u000b\u0000\u0000\u001d\u001e"+
		"\u0003\u0004\u0002\u0000\u001e\u001f\u0005\f\u0000\u0000\u001f%\u0001"+
		"\u0000\u0000\u0000 !\u0003\u0010\b\u0000!\"\u0003\u0002\u0001\u0000\""+
		"%\u0001\u0000\u0000\u0000#%\u0003\u0014\n\u0000$\u001c\u0001\u0000\u0000"+
		"\u0000$ \u0001\u0000\u0000\u0000$#\u0001\u0000\u0000\u0000%\u0003\u0001"+
		"\u0000\u0000\u0000&\'\u0006\u0002\uffff\uffff\u0000\'(\u0005\u000b\u0000"+
		"\u0000()\u0003\u0004\u0002\u0000)*\u0005\f\u0000\u0000*0\u0001\u0000\u0000"+
		"\u0000+,\u0003\u0010\b\u0000,-\u0003\u0004\u0002\u0004-0\u0001\u0000\u0000"+
		"\u0000.0\u0003\u0014\n\u0000/&\u0001\u0000\u0000\u0000/+\u0001\u0000\u0000"+
		"\u0000/.\u0001\u0000\u0000\u00000:\u0001\u0000\u0000\u000012\n\u0003\u0000"+
		"\u000023\u0003\n\u0005\u000034\u0003\u0004\u0002\u000449\u0001\u0000\u0000"+
		"\u000056\n\u0002\u0000\u000067\u0005\u0002\u0000\u000079\u0003\u0004\u0002"+
		"\u000381\u0001\u0000\u0000\u000085\u0001\u0000\u0000\u00009<\u0001\u0000"+
		"\u0000\u0000:8\u0001\u0000\u0000\u0000:;\u0001\u0000\u0000\u0000;\u0005"+
		"\u0001\u0000\u0000\u0000<:\u0001\u0000\u0000\u0000=>\u0006\u0003\uffff"+
		"\uffff\u0000>?\u0005\u000b\u0000\u0000?@\u0003\u0006\u0003\u0000@A\u0005"+
		"\f\u0000\u0000AK\u0001\u0000\u0000\u0000BC\u0003\u0010\b\u0000CD\u0003"+
		"\u0006\u0003\u0006DK\u0001\u0000\u0000\u0000EF\u0003\b\u0004\u0000FG\u0003"+
		"\u0012\t\u0000GH\u0003\u0002\u0001\u0000HK\u0001\u0000\u0000\u0000IK\u0003"+
		"\u0002\u0001\u0000J=\u0001\u0000\u0000\u0000JB\u0001\u0000\u0000\u0000"+
		"JE\u0001\u0000\u0000\u0000JI\u0001\u0000\u0000\u0000KZ\u0001\u0000\u0000"+
		"\u0000LM\n\u0005\u0000\u0000MN\u0003\n\u0005\u0000NO\u0003\u0006\u0003"+
		"\u0006OY\u0001\u0000\u0000\u0000PQ\n\u0004\u0000\u0000QR\u0003\u000e\u0007"+
		"\u0000RS\u0003\u0006\u0003\u0005SY\u0001\u0000\u0000\u0000TU\n\u0003\u0000"+
		"\u0000UV\u0003\f\u0006\u0000VW\u0003\u0006\u0003\u0004WY\u0001\u0000\u0000"+
		"\u0000XL\u0001\u0000\u0000\u0000XP\u0001\u0000\u0000\u0000XT\u0001\u0000"+
		"\u0000\u0000Y\\\u0001\u0000\u0000\u0000ZX\u0001\u0000\u0000\u0000Z[\u0001"+
		"\u0000\u0000\u0000[\u0007\u0001\u0000\u0000\u0000\\Z\u0001\u0000\u0000"+
		"\u0000]^\u0005\u000e\u0000\u0000^\t\u0001\u0000\u0000\u0000_`\u0005\u0001"+
		"\u0000\u0000`\u000b\u0001\u0000\u0000\u0000ab\u0001\u0000\u0000\u0000"+
		"b\r\u0001\u0000\u0000\u0000cd\u0005\u0002\u0000\u0000d\u000f\u0001\u0000"+
		"\u0000\u0000ef\u0005\u0003\u0000\u0000f\u0011\u0001\u0000\u0000\u0000"+
		"gh\u0007\u0000\u0000\u0000h\u0013\u0001\u0000\u0000\u0000ij\u0007\u0001"+
		"\u0000\u0000j\u0015\u0001\u0000\u0000\u0000\b\u001a$/8:JXZ";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}