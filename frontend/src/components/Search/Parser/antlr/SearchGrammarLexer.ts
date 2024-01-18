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
	RuleContext,
	PredictionContextCache,
	Token,
} from 'antlr4'
export default class SearchGrammarLexer extends Lexer {
	public static readonly AND = 1
	public static readonly OR = 2
	public static readonly NOT = 3
	public static readonly BANG = 4
	public static readonly EQ = 5
	public static readonly NEQ = 6
	public static readonly LT = 7
	public static readonly LTE = 8
	public static readonly GT = 9
	public static readonly GTE = 10
	public static readonly LPAREN = 11
	public static readonly RPAREN = 12
	public static readonly COLON = 13
	public static readonly ID = 14
	public static readonly STRING = 15
	public static readonly VALUE = 16
	public static readonly WS = 17
	public static readonly ERROR_CHARACTERS = 18
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
		4, 0, 18, 99, 6, -1, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2,
		4, 7, 4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2,
		10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7, 13, 2, 14, 7, 14, 2,
		15, 7, 15, 2, 16, 7, 16, 2, 17, 7, 17, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1,
		1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 3, 1, 3, 1, 4, 1, 4, 1, 5, 1, 5, 1,
		5, 1, 6, 1, 6, 1, 7, 1, 7, 1, 7, 1, 8, 1, 8, 1, 9, 1, 9, 1, 9, 1, 10, 1,
		10, 1, 11, 1, 11, 1, 12, 1, 12, 1, 13, 4, 13, 73, 8, 13, 11, 13, 12, 13,
		74, 1, 14, 1, 14, 5, 14, 79, 8, 14, 10, 14, 12, 14, 82, 9, 14, 1, 14, 1,
		14, 1, 15, 4, 15, 87, 8, 15, 11, 15, 12, 15, 88, 1, 16, 4, 16, 92, 8,
		16, 11, 16, 12, 16, 93, 1, 16, 1, 16, 1, 17, 1, 17, 1, 80, 0, 18, 1, 1,
		3, 2, 5, 3, 7, 4, 9, 5, 11, 6, 13, 7, 15, 8, 17, 9, 19, 10, 21, 11, 23,
		12, 25, 13, 27, 14, 29, 15, 31, 16, 33, 17, 35, 18, 1, 0, 3, 6, 0, 42,
		42, 45, 46, 48, 57, 65, 90, 95, 95, 97, 122, 6, 0, 9, 10, 12, 13, 32,
		33, 40, 41, 58, 58, 60, 62, 3, 0, 9, 10, 12, 13, 32, 32, 102, 0, 1, 1,
		0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 5, 1, 0, 0, 0, 0, 7, 1, 0, 0, 0, 0, 9, 1,
		0, 0, 0, 0, 11, 1, 0, 0, 0, 0, 13, 1, 0, 0, 0, 0, 15, 1, 0, 0, 0, 0, 17,
		1, 0, 0, 0, 0, 19, 1, 0, 0, 0, 0, 21, 1, 0, 0, 0, 0, 23, 1, 0, 0, 0, 0,
		25, 1, 0, 0, 0, 0, 27, 1, 0, 0, 0, 0, 29, 1, 0, 0, 0, 0, 31, 1, 0, 0, 0,
		0, 33, 1, 0, 0, 0, 0, 35, 1, 0, 0, 0, 1, 37, 1, 0, 0, 0, 3, 41, 1, 0, 0,
		0, 5, 44, 1, 0, 0, 0, 7, 48, 1, 0, 0, 0, 9, 50, 1, 0, 0, 0, 11, 52, 1,
		0, 0, 0, 13, 55, 1, 0, 0, 0, 15, 57, 1, 0, 0, 0, 17, 60, 1, 0, 0, 0, 19,
		62, 1, 0, 0, 0, 21, 65, 1, 0, 0, 0, 23, 67, 1, 0, 0, 0, 25, 69, 1, 0, 0,
		0, 27, 72, 1, 0, 0, 0, 29, 76, 1, 0, 0, 0, 31, 86, 1, 0, 0, 0, 33, 91,
		1, 0, 0, 0, 35, 97, 1, 0, 0, 0, 37, 38, 5, 65, 0, 0, 38, 39, 5, 78, 0,
		0, 39, 40, 5, 68, 0, 0, 40, 2, 1, 0, 0, 0, 41, 42, 5, 79, 0, 0, 42, 43,
		5, 82, 0, 0, 43, 4, 1, 0, 0, 0, 44, 45, 5, 78, 0, 0, 45, 46, 5, 79, 0,
		0, 46, 47, 5, 84, 0, 0, 47, 6, 1, 0, 0, 0, 48, 49, 5, 33, 0, 0, 49, 8,
		1, 0, 0, 0, 50, 51, 5, 61, 0, 0, 51, 10, 1, 0, 0, 0, 52, 53, 5, 33, 0,
		0, 53, 54, 5, 61, 0, 0, 54, 12, 1, 0, 0, 0, 55, 56, 5, 60, 0, 0, 56, 14,
		1, 0, 0, 0, 57, 58, 5, 60, 0, 0, 58, 59, 5, 61, 0, 0, 59, 16, 1, 0, 0,
		0, 60, 61, 5, 62, 0, 0, 61, 18, 1, 0, 0, 0, 62, 63, 5, 62, 0, 0, 63, 64,
		5, 61, 0, 0, 64, 20, 1, 0, 0, 0, 65, 66, 5, 40, 0, 0, 66, 22, 1, 0, 0,
		0, 67, 68, 5, 41, 0, 0, 68, 24, 1, 0, 0, 0, 69, 70, 5, 58, 0, 0, 70, 26,
		1, 0, 0, 0, 71, 73, 7, 0, 0, 0, 72, 71, 1, 0, 0, 0, 73, 74, 1, 0, 0, 0,
		74, 72, 1, 0, 0, 0, 74, 75, 1, 0, 0, 0, 75, 28, 1, 0, 0, 0, 76, 80, 5,
		34, 0, 0, 77, 79, 9, 0, 0, 0, 78, 77, 1, 0, 0, 0, 79, 82, 1, 0, 0, 0,
		80, 81, 1, 0, 0, 0, 80, 78, 1, 0, 0, 0, 81, 83, 1, 0, 0, 0, 82, 80, 1,
		0, 0, 0, 83, 84, 5, 34, 0, 0, 84, 30, 1, 0, 0, 0, 85, 87, 8, 1, 0, 0,
		86, 85, 1, 0, 0, 0, 87, 88, 1, 0, 0, 0, 88, 86, 1, 0, 0, 0, 88, 89, 1,
		0, 0, 0, 89, 32, 1, 0, 0, 0, 90, 92, 7, 2, 0, 0, 91, 90, 1, 0, 0, 0, 92,
		93, 1, 0, 0, 0, 93, 91, 1, 0, 0, 0, 93, 94, 1, 0, 0, 0, 94, 95, 1, 0, 0,
		0, 95, 96, 6, 16, 0, 0, 96, 34, 1, 0, 0, 0, 97, 98, 9, 0, 0, 0, 98, 36,
		1, 0, 0, 0, 5, 0, 74, 80, 88, 93, 1, 6, 0, 0,
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
