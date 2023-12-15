// Generated from /Users/chris/code/highlight/frontend/src/components/Search/Parser/SearchGrammar.g4 by ANTLR 4.13.1
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
		RPAREN=11, COLON=12, ID=13, STRING=14, WS=15;
	public static String[] channelNames = {
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN"
	};

	public static String[] modeNames = {
		"DEFAULT_MODE"
	};

	private static String[] makeRuleNames() {
		return new String[] {
			"AND", "OR", "NOT", "EQ", "NEQ", "LT", "LTE", "GT", "GTE", "LPAREN", 
			"RPAREN", "COLON", "ID", "STRING", "WS"
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
		"\u0004\u0000\u000fT\u0006\uffff\uffff\u0002\u0000\u0007\u0000\u0002\u0001"+
		"\u0007\u0001\u0002\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002\u0004"+
		"\u0007\u0004\u0002\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0002\u0007"+
		"\u0007\u0007\u0002\b\u0007\b\u0002\t\u0007\t\u0002\n\u0007\n\u0002\u000b"+
		"\u0007\u000b\u0002\f\u0007\f\u0002\r\u0007\r\u0002\u000e\u0007\u000e\u0001"+
		"\u0000\u0001\u0000\u0001\u0000\u0001\u0000\u0001\u0001\u0001\u0001\u0001"+
		"\u0001\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0002\u0001\u0003\u0001"+
		"\u0003\u0001\u0004\u0001\u0004\u0001\u0004\u0001\u0005\u0001\u0005\u0001"+
		"\u0006\u0001\u0006\u0001\u0006\u0001\u0007\u0001\u0007\u0001\b\u0001\b"+
		"\u0001\b\u0001\t\u0001\t\u0001\n\u0001\n\u0001\u000b\u0001\u000b\u0001"+
		"\f\u0004\fA\b\f\u000b\f\f\fB\u0001\r\u0001\r\u0005\rG\b\r\n\r\f\rJ\t\r"+
		"\u0001\r\u0001\r\u0001\u000e\u0004\u000eO\b\u000e\u000b\u000e\f\u000e"+
		"P\u0001\u000e\u0001\u000e\u0001H\u0000\u000f\u0001\u0001\u0003\u0002\u0005"+
		"\u0003\u0007\u0004\t\u0005\u000b\u0006\r\u0007\u000f\b\u0011\t\u0013\n"+
		"\u0015\u000b\u0017\f\u0019\r\u001b\u000e\u001d\u000f\u0001\u0000\u0002"+
		"\u0006\u0000**-.09AZ__az\u0003\u0000\t\n\f\r  V\u0000\u0001\u0001\u0000"+
		"\u0000\u0000\u0000\u0003\u0001\u0000\u0000\u0000\u0000\u0005\u0001\u0000"+
		"\u0000\u0000\u0000\u0007\u0001\u0000\u0000\u0000\u0000\t\u0001\u0000\u0000"+
		"\u0000\u0000\u000b\u0001\u0000\u0000\u0000\u0000\r\u0001\u0000\u0000\u0000"+
		"\u0000\u000f\u0001\u0000\u0000\u0000\u0000\u0011\u0001\u0000\u0000\u0000"+
		"\u0000\u0013\u0001\u0000\u0000\u0000\u0000\u0015\u0001\u0000\u0000\u0000"+
		"\u0000\u0017\u0001\u0000\u0000\u0000\u0000\u0019\u0001\u0000\u0000\u0000"+
		"\u0000\u001b\u0001\u0000\u0000\u0000\u0000\u001d\u0001\u0000\u0000\u0000"+
		"\u0001\u001f\u0001\u0000\u0000\u0000\u0003#\u0001\u0000\u0000\u0000\u0005"+
		"&\u0001\u0000\u0000\u0000\u0007*\u0001\u0000\u0000\u0000\t,\u0001\u0000"+
		"\u0000\u0000\u000b/\u0001\u0000\u0000\u0000\r1\u0001\u0000\u0000\u0000"+
		"\u000f4\u0001\u0000\u0000\u0000\u00116\u0001\u0000\u0000\u0000\u00139"+
		"\u0001\u0000\u0000\u0000\u0015;\u0001\u0000\u0000\u0000\u0017=\u0001\u0000"+
		"\u0000\u0000\u0019@\u0001\u0000\u0000\u0000\u001bD\u0001\u0000\u0000\u0000"+
		"\u001dN\u0001\u0000\u0000\u0000\u001f \u0005A\u0000\u0000 !\u0005N\u0000"+
		"\u0000!\"\u0005D\u0000\u0000\"\u0002\u0001\u0000\u0000\u0000#$\u0005O"+
		"\u0000\u0000$%\u0005R\u0000\u0000%\u0004\u0001\u0000\u0000\u0000&\'\u0005"+
		"N\u0000\u0000\'(\u0005O\u0000\u0000()\u0005T\u0000\u0000)\u0006\u0001"+
		"\u0000\u0000\u0000*+\u0005=\u0000\u0000+\b\u0001\u0000\u0000\u0000,-\u0005"+
		"!\u0000\u0000-.\u0005=\u0000\u0000.\n\u0001\u0000\u0000\u0000/0\u0005"+
		"<\u0000\u00000\f\u0001\u0000\u0000\u000012\u0005<\u0000\u000023\u0005"+
		"=\u0000\u00003\u000e\u0001\u0000\u0000\u000045\u0005>\u0000\u00005\u0010"+
		"\u0001\u0000\u0000\u000067\u0005>\u0000\u000078\u0005=\u0000\u00008\u0012"+
		"\u0001\u0000\u0000\u00009:\u0005(\u0000\u0000:\u0014\u0001\u0000\u0000"+
		"\u0000;<\u0005)\u0000\u0000<\u0016\u0001\u0000\u0000\u0000=>\u0005:\u0000"+
		"\u0000>\u0018\u0001\u0000\u0000\u0000?A\u0007\u0000\u0000\u0000@?\u0001"+
		"\u0000\u0000\u0000AB\u0001\u0000\u0000\u0000B@\u0001\u0000\u0000\u0000"+
		"BC\u0001\u0000\u0000\u0000C\u001a\u0001\u0000\u0000\u0000DH\u0005\"\u0000"+
		"\u0000EG\t\u0000\u0000\u0000FE\u0001\u0000\u0000\u0000GJ\u0001\u0000\u0000"+
		"\u0000HI\u0001\u0000\u0000\u0000HF\u0001\u0000\u0000\u0000IK\u0001\u0000"+
		"\u0000\u0000JH\u0001\u0000\u0000\u0000KL\u0005\"\u0000\u0000L\u001c\u0001"+
		"\u0000\u0000\u0000MO\u0007\u0001\u0000\u0000NM\u0001\u0000\u0000\u0000"+
		"OP\u0001\u0000\u0000\u0000PN\u0001\u0000\u0000\u0000PQ\u0001\u0000\u0000"+
		"\u0000QR\u0001\u0000\u0000\u0000RS\u0006\u000e\u0000\u0000S\u001e\u0001"+
		"\u0000\u0000\u0000\u0004\u0000BHP\u0001\u0006\u0000\u0000";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}