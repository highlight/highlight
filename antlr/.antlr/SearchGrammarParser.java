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
		RPAREN=11, COLON=12, ID=13, STRING=14, WS=15;
	public static final int
		RULE_search_query = 0, RULE_col_expr = 1, RULE_search_expr = 2, RULE_search_key = 3, 
		RULE_search_op = 4, RULE_negation_op = 5, RULE_bin_op = 6, RULE_search_value = 7;
	private static String[] makeRuleNames() {
		return new String[] {
			"search_query", "col_expr", "search_expr", "search_key", "search_op", 
			"negation_op", "bin_op", "search_value"
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
			"RPAREN", "COLON", "ID", "STRING", "WS"
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
			setState(20);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case EOF:
				enterOuterAlt(_localctx, 1);
				{
				setState(16);
				match(EOF);
				}
				break;
			case NOT:
			case LPAREN:
			case ID:
			case STRING:
				enterOuterAlt(_localctx, 2);
				{
				setState(17);
				search_expr(0);
				setState(18);
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
	public static class Col_exprContext extends ParserRuleContext {
		public TerminalNode LPAREN() { return getToken(SearchGrammarParser.LPAREN, 0); }
		public Col_exprContext col_expr() {
			return getRuleContext(Col_exprContext.class,0);
		}
		public TerminalNode RPAREN() { return getToken(SearchGrammarParser.RPAREN, 0); }
		public List<Search_valueContext> search_value() {
			return getRuleContexts(Search_valueContext.class);
		}
		public Search_valueContext search_value(int i) {
			return getRuleContext(Search_valueContext.class,i);
		}
		public Search_opContext search_op() {
			return getRuleContext(Search_opContext.class,0);
		}
		public Negation_opContext negation_op() {
			return getRuleContext(Negation_opContext.class,0);
		}
		public Col_exprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_col_expr; }
	}

	public final Col_exprContext col_expr() throws RecognitionException {
		Col_exprContext _localctx = new Col_exprContext(_ctx, getState());
		enterRule(_localctx, 2, RULE_col_expr);
		try {
			setState(38);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,1,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(22);
				match(LPAREN);
				setState(23);
				col_expr();
				setState(24);
				match(RPAREN);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(26);
				search_value();
				setState(27);
				search_op();
				setState(28);
				search_value();
				}
				break;
			case 3:
				enterOuterAlt(_localctx, 3);
				{
				setState(30);
				search_value();
				setState(31);
				search_op();
				setState(32);
				search_value();
				}
				break;
			case 4:
				enterOuterAlt(_localctx, 4);
				{
				setState(34);
				negation_op();
				setState(35);
				col_expr();
				}
				break;
			case 5:
				enterOuterAlt(_localctx, 5);
				{
				setState(37);
				search_value();
				}
				break;
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
	public static class Search_exprContext extends ParserRuleContext {
		public TerminalNode LPAREN() { return getToken(SearchGrammarParser.LPAREN, 0); }
		public List<Search_exprContext> search_expr() {
			return getRuleContexts(Search_exprContext.class);
		}
		public Search_exprContext search_expr(int i) {
			return getRuleContext(Search_exprContext.class,i);
		}
		public TerminalNode RPAREN() { return getToken(SearchGrammarParser.RPAREN, 0); }
		public Negation_opContext negation_op() {
			return getRuleContext(Negation_opContext.class,0);
		}
		public Search_keyContext search_key() {
			return getRuleContext(Search_keyContext.class,0);
		}
		public Bin_opContext bin_op() {
			return getRuleContext(Bin_opContext.class,0);
		}
		public Col_exprContext col_expr() {
			return getRuleContext(Col_exprContext.class,0);
		}
		public Search_opContext search_op() {
			return getRuleContext(Search_opContext.class,0);
		}
		public Search_exprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_search_expr; }
	}

	public final Search_exprContext search_expr() throws RecognitionException {
		return search_expr(0);
	}

	private Search_exprContext search_expr(int _p) throws RecognitionException {
		ParserRuleContext _parentctx = _ctx;
		int _parentState = getState();
		Search_exprContext _localctx = new Search_exprContext(_ctx, _parentState);
		Search_exprContext _prevctx = _localctx;
		int _startState = 4;
		enterRecursionRule(_localctx, 4, RULE_search_expr, _p);
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(57);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,2,_ctx) ) {
			case 1:
				{
				setState(41);
				match(LPAREN);
				setState(42);
				search_expr(0);
				setState(43);
				match(RPAREN);
				}
				break;
			case 2:
				{
				setState(45);
				match(LPAREN);
				setState(46);
				search_expr(0);
				setState(47);
				match(RPAREN);
				}
				break;
			case 3:
				{
				setState(49);
				negation_op();
				setState(50);
				search_expr(3);
				}
				break;
			case 4:
				{
				setState(52);
				search_key();
				setState(53);
				bin_op();
				setState(54);
				col_expr();
				}
				break;
			case 5:
				{
				setState(56);
				col_expr();
				}
				break;
			}
			_ctx.stop = _input.LT(-1);
			setState(71);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,4,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(69);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,3,_ctx) ) {
					case 1:
						{
						_localctx = new Search_exprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_search_expr);
						setState(59);
						if (!(precpred(_ctx, 6))) throw new FailedPredicateException(this, "precpred(_ctx, 6)");
						setState(60);
						search_op();
						setState(61);
						search_expr(7);
						}
						break;
					case 2:
						{
						_localctx = new Search_exprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_search_expr);
						setState(63);
						if (!(precpred(_ctx, 5))) throw new FailedPredicateException(this, "precpred(_ctx, 5)");
						setState(64);
						search_expr(6);
						}
						break;
					case 3:
						{
						_localctx = new Search_exprContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_search_expr);
						setState(65);
						if (!(precpred(_ctx, 4))) throw new FailedPredicateException(this, "precpred(_ctx, 4)");
						setState(66);
						search_op();
						setState(67);
						search_expr(5);
						}
						break;
					}
					} 
				}
				setState(73);
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
	public static class Search_keyContext extends ParserRuleContext {
		public TerminalNode ID() { return getToken(SearchGrammarParser.ID, 0); }
		public Search_keyContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_search_key; }
	}

	public final Search_keyContext search_key() throws RecognitionException {
		Search_keyContext _localctx = new Search_keyContext(_ctx, getState());
		enterRule(_localctx, 6, RULE_search_key);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(74);
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
	public static class Search_opContext extends ParserRuleContext {
		public TerminalNode AND() { return getToken(SearchGrammarParser.AND, 0); }
		public TerminalNode OR() { return getToken(SearchGrammarParser.OR, 0); }
		public Search_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_search_op; }
	}

	public final Search_opContext search_op() throws RecognitionException {
		Search_opContext _localctx = new Search_opContext(_ctx, getState());
		enterRule(_localctx, 8, RULE_search_op);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(76);
			_la = _input.LA(1);
			if ( !(_la==AND || _la==OR) ) {
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
	public static class Negation_opContext extends ParserRuleContext {
		public TerminalNode NOT() { return getToken(SearchGrammarParser.NOT, 0); }
		public Negation_opContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_negation_op; }
	}

	public final Negation_opContext negation_op() throws RecognitionException {
		Negation_opContext _localctx = new Negation_opContext(_ctx, getState());
		enterRule(_localctx, 10, RULE_negation_op);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(78);
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
		enterRule(_localctx, 12, RULE_bin_op);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(80);
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
		public TerminalNode ID() { return getToken(SearchGrammarParser.ID, 0); }
		public TerminalNode STRING() { return getToken(SearchGrammarParser.STRING, 0); }
		public Search_valueContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_search_value; }
	}

	public final Search_valueContext search_value() throws RecognitionException {
		Search_valueContext _localctx = new Search_valueContext(_ctx, getState());
		enterRule(_localctx, 14, RULE_search_value);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(82);
			_la = _input.LA(1);
			if ( !(_la==ID || _la==STRING) ) {
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
			return search_expr_sempred((Search_exprContext)_localctx, predIndex);
		}
		return true;
	}
	private boolean search_expr_sempred(Search_exprContext _localctx, int predIndex) {
		switch (predIndex) {
		case 0:
			return precpred(_ctx, 6);
		case 1:
			return precpred(_ctx, 5);
		case 2:
			return precpred(_ctx, 4);
		}
		return true;
	}

	public static final String _serializedATN =
		"\u0004\u0001\u000fU\u0002\u0000\u0007\u0000\u0002\u0001\u0007\u0001\u0002"+
		"\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002\u0004\u0007\u0004\u0002"+
		"\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0002\u0007\u0007\u0007\u0001"+
		"\u0000\u0001\u0000\u0001\u0000\u0001\u0000\u0003\u0000\u0015\b\u0000\u0001"+
		"\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001"+
		"\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001"+
		"\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0003\u0001\'\b\u0001\u0001"+
		"\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001"+
		"\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001"+
		"\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0003\u0002:\b"+
		"\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001"+
		"\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0005\u0002F\b"+
		"\u0002\n\u0002\f\u0002I\t\u0002\u0001\u0003\u0001\u0003\u0001\u0004\u0001"+
		"\u0004\u0001\u0005\u0001\u0005\u0001\u0006\u0001\u0006\u0001\u0007\u0001"+
		"\u0007\u0001\u0007\u0000\u0001\u0004\b\u0000\u0002\u0004\u0006\b\n\f\u000e"+
		"\u0000\u0003\u0001\u0000\u0001\u0002\u0002\u0000\u0004\t\f\f\u0001\u0000"+
		"\r\u000eX\u0000\u0014\u0001\u0000\u0000\u0000\u0002&\u0001\u0000\u0000"+
		"\u0000\u00049\u0001\u0000\u0000\u0000\u0006J\u0001\u0000\u0000\u0000\b"+
		"L\u0001\u0000\u0000\u0000\nN\u0001\u0000\u0000\u0000\fP\u0001\u0000\u0000"+
		"\u0000\u000eR\u0001\u0000\u0000\u0000\u0010\u0015\u0005\u0000\u0000\u0001"+
		"\u0011\u0012\u0003\u0004\u0002\u0000\u0012\u0013\u0005\u0000\u0000\u0001"+
		"\u0013\u0015\u0001\u0000\u0000\u0000\u0014\u0010\u0001\u0000\u0000\u0000"+
		"\u0014\u0011\u0001\u0000\u0000\u0000\u0015\u0001\u0001\u0000\u0000\u0000"+
		"\u0016\u0017\u0005\n\u0000\u0000\u0017\u0018\u0003\u0002\u0001\u0000\u0018"+
		"\u0019\u0005\u000b\u0000\u0000\u0019\'\u0001\u0000\u0000\u0000\u001a\u001b"+
		"\u0003\u000e\u0007\u0000\u001b\u001c\u0003\b\u0004\u0000\u001c\u001d\u0003"+
		"\u000e\u0007\u0000\u001d\'\u0001\u0000\u0000\u0000\u001e\u001f\u0003\u000e"+
		"\u0007\u0000\u001f \u0003\b\u0004\u0000 !\u0003\u000e\u0007\u0000!\'\u0001"+
		"\u0000\u0000\u0000\"#\u0003\n\u0005\u0000#$\u0003\u0002\u0001\u0000$\'"+
		"\u0001\u0000\u0000\u0000%\'\u0003\u000e\u0007\u0000&\u0016\u0001\u0000"+
		"\u0000\u0000&\u001a\u0001\u0000\u0000\u0000&\u001e\u0001\u0000\u0000\u0000"+
		"&\"\u0001\u0000\u0000\u0000&%\u0001\u0000\u0000\u0000\'\u0003\u0001\u0000"+
		"\u0000\u0000()\u0006\u0002\uffff\uffff\u0000)*\u0005\n\u0000\u0000*+\u0003"+
		"\u0004\u0002\u0000+,\u0005\u000b\u0000\u0000,:\u0001\u0000\u0000\u0000"+
		"-.\u0005\n\u0000\u0000./\u0003\u0004\u0002\u0000/0\u0005\u000b\u0000\u0000"+
		"0:\u0001\u0000\u0000\u000012\u0003\n\u0005\u000023\u0003\u0004\u0002\u0003"+
		"3:\u0001\u0000\u0000\u000045\u0003\u0006\u0003\u000056\u0003\f\u0006\u0000"+
		"67\u0003\u0002\u0001\u00007:\u0001\u0000\u0000\u00008:\u0003\u0002\u0001"+
		"\u00009(\u0001\u0000\u0000\u00009-\u0001\u0000\u0000\u000091\u0001\u0000"+
		"\u0000\u000094\u0001\u0000\u0000\u000098\u0001\u0000\u0000\u0000:G\u0001"+
		"\u0000\u0000\u0000;<\n\u0006\u0000\u0000<=\u0003\b\u0004\u0000=>\u0003"+
		"\u0004\u0002\u0007>F\u0001\u0000\u0000\u0000?@\n\u0005\u0000\u0000@F\u0003"+
		"\u0004\u0002\u0006AB\n\u0004\u0000\u0000BC\u0003\b\u0004\u0000CD\u0003"+
		"\u0004\u0002\u0005DF\u0001\u0000\u0000\u0000E;\u0001\u0000\u0000\u0000"+
		"E?\u0001\u0000\u0000\u0000EA\u0001\u0000\u0000\u0000FI\u0001\u0000\u0000"+
		"\u0000GE\u0001\u0000\u0000\u0000GH\u0001\u0000\u0000\u0000H\u0005\u0001"+
		"\u0000\u0000\u0000IG\u0001\u0000\u0000\u0000JK\u0005\r\u0000\u0000K\u0007"+
		"\u0001\u0000\u0000\u0000LM\u0007\u0000\u0000\u0000M\t\u0001\u0000\u0000"+
		"\u0000NO\u0005\u0003\u0000\u0000O\u000b\u0001\u0000\u0000\u0000PQ\u0007"+
		"\u0001\u0000\u0000Q\r\u0001\u0000\u0000\u0000RS\u0007\u0002\u0000\u0000"+
		"S\u000f\u0001\u0000\u0000\u0000\u0005\u0014&9EG";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}