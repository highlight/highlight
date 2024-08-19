// Generated from ./antlr/SearchGrammar.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols
import {
	ATN,
	ATNDeserializer,
	CharStream,
	DecisionState,
	DFA,
	Lexer,
	LexerATNSimulator,
	PredictionContextCache,
	Token,
} from 'antlr4'
export default class SearchGrammarLexer extends Lexer {
	public static readonly AND = 1
	public static readonly OR = 2
	public static readonly NOT = 3
	public static readonly EXISTS = 4
	public static readonly BANG = 5
	public static readonly EQ = 6
	public static readonly NEQ = 7
	public static readonly LT = 8
	public static readonly LTE = 9
	public static readonly GT = 10
	public static readonly GTE = 11
	public static readonly LPAREN = 12
	public static readonly RPAREN = 13
	public static readonly COLON = 14
	public static readonly ID = 15
	public static readonly STRING = 16
	public static readonly VALUE = 17
	public static readonly WS = 18
	public static readonly ERROR_CHARACTERS = 19
	public static readonly EOF = Token.EOF

	public static readonly channelNames: string[] = [
		'DEFAULT_TOKEN_CHANNEL',
		'HIDDEN',
	]
	public static readonly literalNames: (string | null)[] = [
		null,
		"'AND'",
		"'OR'",
		"'NOT'",
		"'EXISTS'",
		"'!'",
		"'='",
		"'!='",
		"'<'",
		"'<='",
		"'>'",
		"'>='",
		"'('",
		"')'",
		"':'",
	]
	public static readonly symbolicNames: (string | null)[] = [
		null,
		'AND',
		'OR',
		'NOT',
		'EXISTS',
		'BANG',
		'EQ',
		'NEQ',
		'LT',
		'LTE',
		'GT',
		'GTE',
		'LPAREN',
		'RPAREN',
		'COLON',
		'ID',
		'STRING',
		'VALUE',
		'WS',
		'ERROR_CHARACTERS',
	]
	public static readonly modeNames: string[] = ['DEFAULT_MODE']

	public static readonly ruleNames: string[] = [
		'AND',
		'OR',
		'NOT',
		'EXISTS',
		'BANG',
		'EQ',
		'NEQ',
		'LT',
		'LTE',
		'GT',
		'GTE',
		'LPAREN',
		'RPAREN',
		'COLON',
		'ID',
		'STRING',
		'VALUE',
		'WS',
		'ERROR_CHARACTERS',
	]

	constructor(input: CharStream) {
		super(input)
		this._interp = new LexerATNSimulator(
			this,
			SearchGrammarLexer._ATN,
			SearchGrammarLexer.DecisionsToDFA,
			new PredictionContextCache(),
		)
	}

	public get grammarFileName(): string {
		return 'SearchGrammar.g4'
	}

	public get literalNames(): (string | null)[] {
		return SearchGrammarLexer.literalNames
	}
	public get symbolicNames(): (string | null)[] {
		return SearchGrammarLexer.symbolicNames
	}
	public get ruleNames(): string[] {
		return SearchGrammarLexer.ruleNames
	}

	public get serializedATN(): number[] {
		return SearchGrammarLexer._serializedATN
	}

	public get channelNames(): string[] {
		return SearchGrammarLexer.channelNames
	}

	public get modeNames(): string[] {
		return SearchGrammarLexer.modeNames
	}

	public static readonly _serializedATN: number[] = [
		4, 0, 19, 133, 6, -1, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2,
		4, 7, 4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2,
		10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7, 13, 2, 14, 7, 14, 2,
		15, 7, 15, 2, 16, 7, 16, 2, 17, 7, 17, 2, 18, 7, 18, 1, 0, 1, 0, 1, 0,
		1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 3, 1, 3, 1, 3, 1, 3,
		1, 3, 1, 3, 1, 3, 1, 4, 1, 4, 1, 5, 1, 5, 1, 6, 1, 6, 1, 6, 1, 7, 1, 7,
		1, 8, 1, 8, 1, 8, 1, 9, 1, 9, 1, 10, 1, 10, 1, 10, 1, 11, 1, 11, 1, 12,
		1, 12, 1, 13, 1, 13, 1, 14, 4, 14, 82, 8, 14, 11, 14, 12, 14, 83, 1, 15,
		1, 15, 1, 15, 1, 15, 5, 15, 90, 8, 15, 10, 15, 12, 15, 93, 9, 15, 1, 15,
		1, 15, 1, 15, 1, 15, 1, 15, 5, 15, 100, 8, 15, 10, 15, 12, 15, 103, 9,
		15, 1, 15, 3, 15, 106, 8, 15, 1, 15, 1, 15, 1, 15, 1, 15, 5, 15, 112, 8,
		15, 10, 15, 12, 15, 115, 9, 15, 1, 15, 3, 15, 118, 8, 15, 1, 16, 4, 16,
		121, 8, 16, 11, 16, 12, 16, 122, 1, 17, 4, 17, 126, 8, 17, 11, 17, 12,
		17, 127, 1, 17, 1, 17, 1, 18, 1, 18, 0, 0, 19, 1, 1, 3, 2, 5, 3, 7, 4,
		9, 5, 11, 6, 13, 7, 15, 8, 17, 9, 19, 10, 21, 11, 23, 12, 25, 13, 27,
		14, 29, 15, 31, 16, 33, 17, 35, 18, 37, 19, 1, 0, 16, 2, 0, 65, 65, 97,
		97, 2, 0, 78, 78, 110, 110, 2, 0, 68, 68, 100, 100, 2, 0, 79, 79, 111,
		111, 2, 0, 82, 82, 114, 114, 2, 0, 84, 84, 116, 116, 2, 0, 69, 69, 101,
		101, 2, 0, 88, 88, 120, 120, 2, 0, 73, 73, 105, 105, 2, 0, 83, 83, 115,
		115, 6, 0, 42, 42, 45, 46, 48, 57, 65, 90, 95, 95, 97, 122, 1, 0, 34,
		34, 1, 0, 39, 39, 1, 0, 96, 96, 6, 0, 9, 10, 12, 13, 32, 33, 40, 41, 58,
		58, 60, 62, 3, 0, 9, 10, 12, 13, 32, 32, 143, 0, 1, 1, 0, 0, 0, 0, 3, 1,
		0, 0, 0, 0, 5, 1, 0, 0, 0, 0, 7, 1, 0, 0, 0, 0, 9, 1, 0, 0, 0, 0, 11, 1,
		0, 0, 0, 0, 13, 1, 0, 0, 0, 0, 15, 1, 0, 0, 0, 0, 17, 1, 0, 0, 0, 0, 19,
		1, 0, 0, 0, 0, 21, 1, 0, 0, 0, 0, 23, 1, 0, 0, 0, 0, 25, 1, 0, 0, 0, 0,
		27, 1, 0, 0, 0, 0, 29, 1, 0, 0, 0, 0, 31, 1, 0, 0, 0, 0, 33, 1, 0, 0, 0,
		0, 35, 1, 0, 0, 0, 0, 37, 1, 0, 0, 0, 1, 39, 1, 0, 0, 0, 3, 43, 1, 0, 0,
		0, 5, 46, 1, 0, 0, 0, 7, 50, 1, 0, 0, 0, 9, 57, 1, 0, 0, 0, 11, 59, 1,
		0, 0, 0, 13, 61, 1, 0, 0, 0, 15, 64, 1, 0, 0, 0, 17, 66, 1, 0, 0, 0, 19,
		69, 1, 0, 0, 0, 21, 71, 1, 0, 0, 0, 23, 74, 1, 0, 0, 0, 25, 76, 1, 0, 0,
		0, 27, 78, 1, 0, 0, 0, 29, 81, 1, 0, 0, 0, 31, 117, 1, 0, 0, 0, 33, 120,
		1, 0, 0, 0, 35, 125, 1, 0, 0, 0, 37, 131, 1, 0, 0, 0, 39, 40, 7, 0, 0,
		0, 40, 41, 7, 1, 0, 0, 41, 42, 7, 2, 0, 0, 42, 2, 1, 0, 0, 0, 43, 44, 7,
		3, 0, 0, 44, 45, 7, 4, 0, 0, 45, 4, 1, 0, 0, 0, 46, 47, 7, 1, 0, 0, 47,
		48, 7, 3, 0, 0, 48, 49, 7, 5, 0, 0, 49, 6, 1, 0, 0, 0, 50, 51, 7, 6, 0,
		0, 51, 52, 7, 7, 0, 0, 52, 53, 7, 8, 0, 0, 53, 54, 7, 9, 0, 0, 54, 55,
		7, 5, 0, 0, 55, 56, 7, 9, 0, 0, 56, 8, 1, 0, 0, 0, 57, 58, 5, 33, 0, 0,
		58, 10, 1, 0, 0, 0, 59, 60, 5, 61, 0, 0, 60, 12, 1, 0, 0, 0, 61, 62, 5,
		33, 0, 0, 62, 63, 5, 61, 0, 0, 63, 14, 1, 0, 0, 0, 64, 65, 5, 60, 0, 0,
		65, 16, 1, 0, 0, 0, 66, 67, 5, 60, 0, 0, 67, 68, 5, 61, 0, 0, 68, 18, 1,
		0, 0, 0, 69, 70, 5, 62, 0, 0, 70, 20, 1, 0, 0, 0, 71, 72, 5, 62, 0, 0,
		72, 73, 5, 61, 0, 0, 73, 22, 1, 0, 0, 0, 74, 75, 5, 40, 0, 0, 75, 24, 1,
		0, 0, 0, 76, 77, 5, 41, 0, 0, 77, 26, 1, 0, 0, 0, 78, 79, 5, 58, 0, 0,
		79, 28, 1, 0, 0, 0, 80, 82, 7, 10, 0, 0, 81, 80, 1, 0, 0, 0, 82, 83, 1,
		0, 0, 0, 83, 81, 1, 0, 0, 0, 83, 84, 1, 0, 0, 0, 84, 30, 1, 0, 0, 0, 85,
		91, 5, 34, 0, 0, 86, 87, 5, 92, 0, 0, 87, 90, 5, 34, 0, 0, 88, 90, 8,
		11, 0, 0, 89, 86, 1, 0, 0, 0, 89, 88, 1, 0, 0, 0, 90, 93, 1, 0, 0, 0,
		91, 89, 1, 0, 0, 0, 91, 92, 1, 0, 0, 0, 92, 94, 1, 0, 0, 0, 93, 91, 1,
		0, 0, 0, 94, 106, 5, 34, 0, 0, 95, 101, 5, 39, 0, 0, 96, 97, 5, 92, 0,
		0, 97, 100, 5, 39, 0, 0, 98, 100, 8, 12, 0, 0, 99, 96, 1, 0, 0, 0, 99,
		98, 1, 0, 0, 0, 100, 103, 1, 0, 0, 0, 101, 99, 1, 0, 0, 0, 101, 102, 1,
		0, 0, 0, 102, 104, 1, 0, 0, 0, 103, 101, 1, 0, 0, 0, 104, 106, 5, 39, 0,
		0, 105, 85, 1, 0, 0, 0, 105, 95, 1, 0, 0, 0, 106, 118, 1, 0, 0, 0, 107,
		113, 5, 96, 0, 0, 108, 109, 5, 92, 0, 0, 109, 112, 5, 96, 0, 0, 110,
		112, 8, 13, 0, 0, 111, 108, 1, 0, 0, 0, 111, 110, 1, 0, 0, 0, 112, 115,
		1, 0, 0, 0, 113, 111, 1, 0, 0, 0, 113, 114, 1, 0, 0, 0, 114, 116, 1, 0,
		0, 0, 115, 113, 1, 0, 0, 0, 116, 118, 5, 96, 0, 0, 117, 105, 1, 0, 0, 0,
		117, 107, 1, 0, 0, 0, 118, 32, 1, 0, 0, 0, 119, 121, 8, 14, 0, 0, 120,
		119, 1, 0, 0, 0, 121, 122, 1, 0, 0, 0, 122, 120, 1, 0, 0, 0, 122, 123,
		1, 0, 0, 0, 123, 34, 1, 0, 0, 0, 124, 126, 7, 15, 0, 0, 125, 124, 1, 0,
		0, 0, 126, 127, 1, 0, 0, 0, 127, 125, 1, 0, 0, 0, 127, 128, 1, 0, 0, 0,
		128, 129, 1, 0, 0, 0, 129, 130, 6, 17, 0, 0, 130, 36, 1, 0, 0, 0, 131,
		132, 9, 0, 0, 0, 132, 38, 1, 0, 0, 0, 12, 0, 83, 89, 91, 99, 101, 105,
		111, 113, 117, 122, 127, 1, 0, 1, 0,
	]

	private static __ATN: ATN
	public static get _ATN(): ATN {
		if (!SearchGrammarLexer.__ATN) {
			SearchGrammarLexer.__ATN = new ATNDeserializer().deserialize(
				SearchGrammarLexer._serializedATN,
			)
		}

		return SearchGrammarLexer.__ATN
	}

	static DecisionsToDFA = SearchGrammarLexer._ATN.decisionToState.map(
		(ds: DecisionState, index: number) => new DFA(ds, index),
	)
}
