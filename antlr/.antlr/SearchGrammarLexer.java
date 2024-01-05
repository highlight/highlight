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
		AND=1, OR=2, NOT=3, EQ=4, NEQ=5, LT=6, LTE=7, GT=8, GTE=9, LPAREN=10, 
		RPAREN=11, COLON=12, ID=13, STRING=14, VALUE=15, WS=16;
	public static String[] channelNames = {
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN"
	};

	public static String[] modeNames = {
		"DEFAULT_MODE"
	};

	private static String[] makeRuleNames() {
		return new String[] {
			"AND", "OR", "NOT", "EQ", "NEQ", "LT", "LTE", "GT", "GTE", "LPAREN", 
			"RPAREN", "COLON", "ID", "STRING", "VALUE", "WS"
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
			"RPAREN", "COLON", "ID", "STRING", "VALUE", "WS"
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
		"\u0004\u0000\u0010[\u0006\uffff\uffff\u0002\u0000\u0007\u0000\u0002\u0001"+
		"\u0007\u0001\u0002\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002\u0004"+
		"\u0007\u0004\u0002\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0002\u0007"+
		"\u0007\u0007\u0002\b\u0007\b\u0002\t\u0007\t\u0002\n\u0007\n\u0002\u000b"+
		"\u0007\u000b\u0002\f\u0007\f\u0002\r\u0007\r\u0002\u000e\u0007\u000e\u0002"+
		"\u000f\u0007\u000f\u0001\u0000\u0001\u0000\u0001\u0000\u0001\u0000\u0001"+
		"\u0001\u0001\u0001\u0001\u0001\u0001\u0002\u0001\u0002\u0001\u0002\u0001"+
		"\u0002\u0001\u0003\u0001\u0003\u0001\u0004\u0001\u0004\u0001\u0004\u0001"+
		"\u0005\u0001\u0005\u0001\u0006\u0001\u0006\u0001\u0006\u0001\u0007\u0001"+
		"\u0007\u0001\b\u0001\b\u0001\b\u0001\t\u0001\t\u0001\n\u0001\n\u0001\u000b"+
		"\u0001\u000b\u0001\f\u0004\fC\b\f\u000b\f\f\fD\u0001\r\u0001\r\u0005\r"+
		"I\b\r\n\r\f\rL\t\r\u0001\r\u0001\r\u0001\u000e\u0004\u000eQ\b\u000e\u000b"+
		"\u000e\f\u000eR\u0001\u000f\u0004\u000fV\b\u000f\u000b\u000f\f\u000fW"+
		"\u0001\u000f\u0001\u000f\u0001J\u0000\u0010\u0001\u0001\u0003\u0002\u0005"+
		"\u0003\u0007\u0004\t\u0005\u000b\u0006\r\u0007\u000f\b\u0011\t\u0013\n"+
		"\u0015\u000b\u0017\f\u0019\r\u001b\u000e\u001d\u000f\u001f\u0010\u0001"+
		"\u0000\u0003\u0006\u0000**-.09AZ__az\u0006\u0000\t\n\f\r !()::<>\u0003"+
		"\u0000\t\n\f\r  ^\u0000\u0001\u0001\u0000\u0000\u0000\u0000\u0003\u0001"+
		"\u0000\u0000\u0000\u0000\u0005\u0001\u0000\u0000\u0000\u0000\u0007\u0001"+
		"\u0000\u0000\u0000\u0000\t\u0001\u0000\u0000\u0000\u0000\u000b\u0001\u0000"+
		"\u0000\u0000\u0000\r\u0001\u0000\u0000\u0000\u0000\u000f\u0001\u0000\u0000"+
		"\u0000\u0000\u0011\u0001\u0000\u0000\u0000\u0000\u0013\u0001\u0000\u0000"+
		"\u0000\u0000\u0015\u0001\u0000\u0000\u0000\u0000\u0017\u0001\u0000\u0000"+
		"\u0000\u0000\u0019\u0001\u0000\u0000\u0000\u0000\u001b\u0001\u0000\u0000"+
		"\u0000\u0000\u001d\u0001\u0000\u0000\u0000\u0000\u001f\u0001\u0000\u0000"+
		"\u0000\u0001!\u0001\u0000\u0000\u0000\u0003%\u0001\u0000\u0000\u0000\u0005"+
		"(\u0001\u0000\u0000\u0000\u0007,\u0001\u0000\u0000\u0000\t.\u0001\u0000"+
		"\u0000\u0000\u000b1\u0001\u0000\u0000\u0000\r3\u0001\u0000\u0000\u0000"+
		"\u000f6\u0001\u0000\u0000\u0000\u00118\u0001\u0000\u0000\u0000\u0013;"+
		"\u0001\u0000\u0000\u0000\u0015=\u0001\u0000\u0000\u0000\u0017?\u0001\u0000"+
		"\u0000\u0000\u0019B\u0001\u0000\u0000\u0000\u001bF\u0001\u0000\u0000\u0000"+
		"\u001dP\u0001\u0000\u0000\u0000\u001fU\u0001\u0000\u0000\u0000!\"\u0005"+
		"A\u0000\u0000\"#\u0005N\u0000\u0000#$\u0005D\u0000\u0000$\u0002\u0001"+
		"\u0000\u0000\u0000%&\u0005O\u0000\u0000&\'\u0005R\u0000\u0000\'\u0004"+
		"\u0001\u0000\u0000\u0000()\u0005N\u0000\u0000)*\u0005O\u0000\u0000*+\u0005"+
		"T\u0000\u0000+\u0006\u0001\u0000\u0000\u0000,-\u0005=\u0000\u0000-\b\u0001"+
		"\u0000\u0000\u0000./\u0005!\u0000\u0000/0\u0005=\u0000\u00000\n\u0001"+
		"\u0000\u0000\u000012\u0005<\u0000\u00002\f\u0001\u0000\u0000\u000034\u0005"+
		"<\u0000\u000045\u0005=\u0000\u00005\u000e\u0001\u0000\u0000\u000067\u0005"+
		">\u0000\u00007\u0010\u0001\u0000\u0000\u000089\u0005>\u0000\u00009:\u0005"+
		"=\u0000\u0000:\u0012\u0001\u0000\u0000\u0000;<\u0005(\u0000\u0000<\u0014"+
		"\u0001\u0000\u0000\u0000=>\u0005)\u0000\u0000>\u0016\u0001\u0000\u0000"+
		"\u0000?@\u0005:\u0000\u0000@\u0018\u0001\u0000\u0000\u0000AC\u0007\u0000"+
		"\u0000\u0000BA\u0001\u0000\u0000\u0000CD\u0001\u0000\u0000\u0000DB\u0001"+
		"\u0000\u0000\u0000DE\u0001\u0000\u0000\u0000E\u001a\u0001\u0000\u0000"+
		"\u0000FJ\u0005\"\u0000\u0000GI\t\u0000\u0000\u0000HG\u0001\u0000\u0000"+
		"\u0000IL\u0001\u0000\u0000\u0000JK\u0001\u0000\u0000\u0000JH\u0001\u0000"+
		"\u0000\u0000KM\u0001\u0000\u0000\u0000LJ\u0001\u0000\u0000\u0000MN\u0005"+
		"\"\u0000\u0000N\u001c\u0001\u0000\u0000\u0000OQ\b\u0001\u0000\u0000PO"+
		"\u0001\u0000\u0000\u0000QR\u0001\u0000\u0000\u0000RP\u0001\u0000\u0000"+
		"\u0000RS\u0001\u0000\u0000\u0000S\u001e\u0001\u0000\u0000\u0000TV\u0007"+
		"\u0002\u0000\u0000UT\u0001\u0000\u0000\u0000VW\u0001\u0000\u0000\u0000"+
		"WU\u0001\u0000\u0000\u0000WX\u0001\u0000\u0000\u0000XY\u0001\u0000\u0000"+
		"\u0000YZ\u0006\u000f\u0000\u0000Z \u0001\u0000\u0000\u0000\u0005\u0000"+
		"DJRW\u0001\u0006\u0000\u0000";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}