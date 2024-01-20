// Generated from /Users/chris/code/highlight/antlr/SearchGrammar.g4 by ANTLR 4.13.1
import org.antlr.v4.runtime.Lexer;
import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.Token;
import org.antlr.v4.runtime.TokenStream;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.misc.*;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast", "CheckReturnValue", "this-escape"})
public class SearchGrammarLexer extends Lexer {
	static { RuntimeMetaData.checkVersion("4.13.1", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		AND=1, OR=2, NOT=3, BANG=4, EQ=5, NEQ=6, LT=7, LTE=8, GT=9, GTE=10, LPAREN=11, 
		RPAREN=12, COLON=13, ID=14, STRING=15, VALUE=16, WS=17, ERROR_CHARACTERS=18;
	public static String[] channelNames = {
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN"
	};

	public static String[] modeNames = {
		"DEFAULT_MODE"
	};

	private static String[] makeRuleNames() {
		return new String[] {
			"AND", "OR", "NOT", "BANG", "EQ", "NEQ", "LT", "LTE", "GT", "GTE", "LPAREN", 
			"RPAREN", "COLON", "ID", "STRING", "VALUE", "WS", "ERROR_CHARACTERS"
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


	public SearchGrammarLexer(CharStream input) {
		super(input);
		_interp = new LexerATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	@Override
	public String getGrammarFileName() { return "SearchGrammar.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public String[] getChannelNames() { return channelNames; }

	@Override
	public String[] getModeNames() { return modeNames; }

	@Override
	public ATN getATN() { return _ATN; }

	public static final String _serializedATN =
		"\u0004\u0000\u0012c\u0006\uffff\uffff\u0002\u0000\u0007\u0000\u0002\u0001"+
		"\u0007\u0001\u0002\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002\u0004"+
		"\u0007\u0004\u0002\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0002\u0007"+
		"\u0007\u0007\u0002\b\u0007\b\u0002\t\u0007\t\u0002\n\u0007\n\u0002\u000b"+
		"\u0007\u000b\u0002\f\u0007\f\u0002\r\u0007\r\u0002\u000e\u0007\u000e\u0002"+
		"\u000f\u0007\u000f\u0002\u0010\u0007\u0010\u0002\u0011\u0007\u0011\u0001"+
		"\u0000\u0001\u0000\u0001\u0000\u0001\u0000\u0001\u0001\u0001\u0001\u0001"+
		"\u0001\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0003\u0001"+
		"\u0003\u0001\u0004\u0001\u0004\u0001\u0005\u0001\u0005\u0001\u0005\u0001"+
		"\u0006\u0001\u0006\u0001\u0007\u0001\u0007\u0001\u0007\u0001\b\u0001\b"+
		"\u0001\t\u0001\t\u0001\t\u0001\n\u0001\n\u0001\u000b\u0001\u000b\u0001"+
		"\f\u0001\f\u0001\r\u0004\rI\b\r\u000b\r\f\rJ\u0001\u000e\u0001\u000e\u0005"+
		"\u000eO\b\u000e\n\u000e\f\u000eR\t\u000e\u0001\u000e\u0001\u000e\u0001"+
		"\u000f\u0004\u000fW\b\u000f\u000b\u000f\f\u000fX\u0001\u0010\u0004\u0010"+
		"\\\b\u0010\u000b\u0010\f\u0010]\u0001\u0010\u0001\u0010\u0001\u0011\u0001"+
		"\u0011\u0001P\u0000\u0012\u0001\u0001\u0003\u0002\u0005\u0003\u0007\u0004"+
		"\t\u0005\u000b\u0006\r\u0007\u000f\b\u0011\t\u0013\n\u0015\u000b\u0017"+
		"\f\u0019\r\u001b\u000e\u001d\u000f\u001f\u0010!\u0011#\u0012\u0001\u0000"+
		"\u0003\u0006\u0000**-.09AZ__az\u0006\u0000\t\n\f\r !()::<>\u0003\u0000"+
		"\t\n\f\r  f\u0000\u0001\u0001\u0000\u0000\u0000\u0000\u0003\u0001\u0000"+
		"\u0000\u0000\u0000\u0005\u0001\u0000\u0000\u0000\u0000\u0007\u0001\u0000"+
		"\u0000\u0000\u0000\t\u0001\u0000\u0000\u0000\u0000\u000b\u0001\u0000\u0000"+
		"\u0000\u0000\r\u0001\u0000\u0000\u0000\u0000\u000f\u0001\u0000\u0000\u0000"+
		"\u0000\u0011\u0001\u0000\u0000\u0000\u0000\u0013\u0001\u0000\u0000\u0000"+
		"\u0000\u0015\u0001\u0000\u0000\u0000\u0000\u0017\u0001\u0000\u0000\u0000"+
		"\u0000\u0019\u0001\u0000\u0000\u0000\u0000\u001b\u0001\u0000\u0000\u0000"+
		"\u0000\u001d\u0001\u0000\u0000\u0000\u0000\u001f\u0001\u0000\u0000\u0000"+
		"\u0000!\u0001\u0000\u0000\u0000\u0000#\u0001\u0000\u0000\u0000\u0001%"+
		"\u0001\u0000\u0000\u0000\u0003)\u0001\u0000\u0000\u0000\u0005,\u0001\u0000"+
		"\u0000\u0000\u00070\u0001\u0000\u0000\u0000\t2\u0001\u0000\u0000\u0000"+
		"\u000b4\u0001\u0000\u0000\u0000\r7\u0001\u0000\u0000\u0000\u000f9\u0001"+
		"\u0000\u0000\u0000\u0011<\u0001\u0000\u0000\u0000\u0013>\u0001\u0000\u0000"+
		"\u0000\u0015A\u0001\u0000\u0000\u0000\u0017C\u0001\u0000\u0000\u0000\u0019"+
		"E\u0001\u0000\u0000\u0000\u001bH\u0001\u0000\u0000\u0000\u001dL\u0001"+
		"\u0000\u0000\u0000\u001fV\u0001\u0000\u0000\u0000![\u0001\u0000\u0000"+
		"\u0000#a\u0001\u0000\u0000\u0000%&\u0005A\u0000\u0000&\'\u0005N\u0000"+
		"\u0000\'(\u0005D\u0000\u0000(\u0002\u0001\u0000\u0000\u0000)*\u0005O\u0000"+
		"\u0000*+\u0005R\u0000\u0000+\u0004\u0001\u0000\u0000\u0000,-\u0005N\u0000"+
		"\u0000-.\u0005O\u0000\u0000./\u0005T\u0000\u0000/\u0006\u0001\u0000\u0000"+
		"\u000001\u0005!\u0000\u00001\b\u0001\u0000\u0000\u000023\u0005=\u0000"+
		"\u00003\n\u0001\u0000\u0000\u000045\u0005!\u0000\u000056\u0005=\u0000"+
		"\u00006\f\u0001\u0000\u0000\u000078\u0005<\u0000\u00008\u000e\u0001\u0000"+
		"\u0000\u00009:\u0005<\u0000\u0000:;\u0005=\u0000\u0000;\u0010\u0001\u0000"+
		"\u0000\u0000<=\u0005>\u0000\u0000=\u0012\u0001\u0000\u0000\u0000>?\u0005"+
		">\u0000\u0000?@\u0005=\u0000\u0000@\u0014\u0001\u0000\u0000\u0000AB\u0005"+
		"(\u0000\u0000B\u0016\u0001\u0000\u0000\u0000CD\u0005)\u0000\u0000D\u0018"+
		"\u0001\u0000\u0000\u0000EF\u0005:\u0000\u0000F\u001a\u0001\u0000\u0000"+
		"\u0000GI\u0007\u0000\u0000\u0000HG\u0001\u0000\u0000\u0000IJ\u0001\u0000"+
		"\u0000\u0000JH\u0001\u0000\u0000\u0000JK\u0001\u0000\u0000\u0000K\u001c"+
		"\u0001\u0000\u0000\u0000LP\u0005\"\u0000\u0000MO\t\u0000\u0000\u0000N"+
		"M\u0001\u0000\u0000\u0000OR\u0001\u0000\u0000\u0000PQ\u0001\u0000\u0000"+
		"\u0000PN\u0001\u0000\u0000\u0000QS\u0001\u0000\u0000\u0000RP\u0001\u0000"+
		"\u0000\u0000ST\u0005\"\u0000\u0000T\u001e\u0001\u0000\u0000\u0000UW\b"+
		"\u0001\u0000\u0000VU\u0001\u0000\u0000\u0000WX\u0001\u0000\u0000\u0000"+
		"XV\u0001\u0000\u0000\u0000XY\u0001\u0000\u0000\u0000Y \u0001\u0000\u0000"+
		"\u0000Z\\\u0007\u0002\u0000\u0000[Z\u0001\u0000\u0000\u0000\\]\u0001\u0000"+
		"\u0000\u0000][\u0001\u0000\u0000\u0000]^\u0001\u0000\u0000\u0000^_\u0001"+
		"\u0000\u0000\u0000_`\u0006\u0010\u0000\u0000`\"\u0001\u0000\u0000\u0000"+
		"ab\t\u0000\u0000\u0000b$\u0001\u0000\u0000\u0000\u0005\u0000JPX]\u0001"+
		"\u0006\u0000\u0000";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}