// Code generated from ./antlr/SearchGrammar.g4 by ANTLR 4.13.2. DO NOT EDIT.

package parser

import (
	"fmt"
	"github.com/antlr4-go/antlr/v4"
	"sync"
	"unicode"
)

// Suppress unused import error
var _ = fmt.Printf
var _ = sync.Once{}
var _ = unicode.IsLetter

type SearchGrammarLexer struct {
	*antlr.BaseLexer
	channelNames []string
	modeNames    []string
	// TODO: EOF string
}

var SearchGrammarLexerLexerStaticData struct {
	once                   sync.Once
	serializedATN          []int32
	ChannelNames           []string
	ModeNames              []string
	LiteralNames           []string
	SymbolicNames          []string
	RuleNames              []string
	PredictionContextCache *antlr.PredictionContextCache
	atn                    *antlr.ATN
	decisionToDFA          []*antlr.DFA
}

func searchgrammarlexerLexerInit() {
	staticData := &SearchGrammarLexerLexerStaticData
	staticData.ChannelNames = []string{
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	}
	staticData.ModeNames = []string{
		"DEFAULT_MODE",
	}
	staticData.LiteralNames = []string{
		"", "'AND'", "'OR'", "'NOT'", "'EXISTS'", "'!'", "'='", "'!='", "'<'",
		"'<='", "'>'", "'>='", "'('", "')'", "':'",
	}
	staticData.SymbolicNames = []string{
		"", "AND", "OR", "NOT", "EXISTS", "BANG", "EQ", "NEQ", "LT", "LTE",
		"GT", "GTE", "LPAREN", "RPAREN", "COLON", "ID", "STRING", "VALUE", "WS",
		"ERROR_CHARACTERS",
	}
	staticData.RuleNames = []string{
		"AND", "OR", "NOT", "EXISTS", "BANG", "EQ", "NEQ", "LT", "LTE", "GT",
		"GTE", "LPAREN", "RPAREN", "COLON", "ID", "STRING", "VALUE", "WHITESPACE",
		"WS", "ERROR_CHARACTERS",
	}
	staticData.PredictionContextCache = antlr.NewPredictionContextCache()
	staticData.serializedATN = []int32{
		4, 0, 19, 137, 6, -1, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2,
		4, 7, 4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2,
		10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7, 13, 2, 14, 7, 14, 2, 15,
		7, 15, 2, 16, 7, 16, 2, 17, 7, 17, 2, 18, 7, 18, 2, 19, 7, 19, 1, 0, 1,
		0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 3, 1, 3, 1,
		3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 4, 1, 4, 1, 5, 1, 5, 1, 6, 1, 6, 1, 6, 1,
		7, 1, 7, 1, 8, 1, 8, 1, 8, 1, 9, 1, 9, 1, 10, 1, 10, 1, 10, 1, 11, 1, 11,
		1, 12, 1, 12, 1, 13, 1, 13, 1, 14, 4, 14, 84, 8, 14, 11, 14, 12, 14, 85,
		1, 15, 1, 15, 1, 15, 1, 15, 5, 15, 92, 8, 15, 10, 15, 12, 15, 95, 9, 15,
		1, 15, 1, 15, 1, 15, 1, 15, 1, 15, 5, 15, 102, 8, 15, 10, 15, 12, 15, 105,
		9, 15, 1, 15, 3, 15, 108, 8, 15, 1, 15, 1, 15, 1, 15, 1, 15, 5, 15, 114,
		8, 15, 10, 15, 12, 15, 117, 9, 15, 1, 15, 3, 15, 120, 8, 15, 1, 16, 4,
		16, 123, 8, 16, 11, 16, 12, 16, 124, 1, 17, 1, 17, 1, 18, 4, 18, 130, 8,
		18, 11, 18, 12, 18, 131, 1, 18, 1, 18, 1, 19, 1, 19, 0, 0, 20, 1, 1, 3,
		2, 5, 3, 7, 4, 9, 5, 11, 6, 13, 7, 15, 8, 17, 9, 19, 10, 21, 11, 23, 12,
		25, 13, 27, 14, 29, 15, 31, 16, 33, 17, 35, 0, 37, 18, 39, 19, 1, 0, 16,
		2, 0, 65, 65, 97, 97, 2, 0, 78, 78, 110, 110, 2, 0, 68, 68, 100, 100, 2,
		0, 79, 79, 111, 111, 2, 0, 82, 82, 114, 114, 2, 0, 84, 84, 116, 116, 2,
		0, 69, 69, 101, 101, 2, 0, 88, 88, 120, 120, 2, 0, 73, 73, 105, 105, 2,
		0, 83, 83, 115, 115, 6, 0, 42, 42, 45, 46, 48, 57, 65, 90, 95, 95, 97,
		122, 1, 0, 34, 34, 1, 0, 39, 39, 1, 0, 96, 96, 6, 0, 9, 10, 12, 13, 32,
		33, 40, 41, 58, 58, 60, 62, 3, 0, 9, 10, 12, 13, 32, 32, 146, 0, 1, 1,
		0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 5, 1, 0, 0, 0, 0, 7, 1, 0, 0, 0, 0, 9, 1,
		0, 0, 0, 0, 11, 1, 0, 0, 0, 0, 13, 1, 0, 0, 0, 0, 15, 1, 0, 0, 0, 0, 17,
		1, 0, 0, 0, 0, 19, 1, 0, 0, 0, 0, 21, 1, 0, 0, 0, 0, 23, 1, 0, 0, 0, 0,
		25, 1, 0, 0, 0, 0, 27, 1, 0, 0, 0, 0, 29, 1, 0, 0, 0, 0, 31, 1, 0, 0, 0,
		0, 33, 1, 0, 0, 0, 0, 37, 1, 0, 0, 0, 0, 39, 1, 0, 0, 0, 1, 41, 1, 0, 0,
		0, 3, 45, 1, 0, 0, 0, 5, 48, 1, 0, 0, 0, 7, 52, 1, 0, 0, 0, 9, 59, 1, 0,
		0, 0, 11, 61, 1, 0, 0, 0, 13, 63, 1, 0, 0, 0, 15, 66, 1, 0, 0, 0, 17, 68,
		1, 0, 0, 0, 19, 71, 1, 0, 0, 0, 21, 73, 1, 0, 0, 0, 23, 76, 1, 0, 0, 0,
		25, 78, 1, 0, 0, 0, 27, 80, 1, 0, 0, 0, 29, 83, 1, 0, 0, 0, 31, 119, 1,
		0, 0, 0, 33, 122, 1, 0, 0, 0, 35, 126, 1, 0, 0, 0, 37, 129, 1, 0, 0, 0,
		39, 135, 1, 0, 0, 0, 41, 42, 7, 0, 0, 0, 42, 43, 7, 1, 0, 0, 43, 44, 7,
		2, 0, 0, 44, 2, 1, 0, 0, 0, 45, 46, 7, 3, 0, 0, 46, 47, 7, 4, 0, 0, 47,
		4, 1, 0, 0, 0, 48, 49, 7, 1, 0, 0, 49, 50, 7, 3, 0, 0, 50, 51, 7, 5, 0,
		0, 51, 6, 1, 0, 0, 0, 52, 53, 7, 6, 0, 0, 53, 54, 7, 7, 0, 0, 54, 55, 7,
		8, 0, 0, 55, 56, 7, 9, 0, 0, 56, 57, 7, 5, 0, 0, 57, 58, 7, 9, 0, 0, 58,
		8, 1, 0, 0, 0, 59, 60, 5, 33, 0, 0, 60, 10, 1, 0, 0, 0, 61, 62, 5, 61,
		0, 0, 62, 12, 1, 0, 0, 0, 63, 64, 5, 33, 0, 0, 64, 65, 5, 61, 0, 0, 65,
		14, 1, 0, 0, 0, 66, 67, 5, 60, 0, 0, 67, 16, 1, 0, 0, 0, 68, 69, 5, 60,
		0, 0, 69, 70, 5, 61, 0, 0, 70, 18, 1, 0, 0, 0, 71, 72, 5, 62, 0, 0, 72,
		20, 1, 0, 0, 0, 73, 74, 5, 62, 0, 0, 74, 75, 5, 61, 0, 0, 75, 22, 1, 0,
		0, 0, 76, 77, 5, 40, 0, 0, 77, 24, 1, 0, 0, 0, 78, 79, 5, 41, 0, 0, 79,
		26, 1, 0, 0, 0, 80, 81, 5, 58, 0, 0, 81, 28, 1, 0, 0, 0, 82, 84, 7, 10,
		0, 0, 83, 82, 1, 0, 0, 0, 84, 85, 1, 0, 0, 0, 85, 83, 1, 0, 0, 0, 85, 86,
		1, 0, 0, 0, 86, 30, 1, 0, 0, 0, 87, 93, 5, 34, 0, 0, 88, 89, 5, 92, 0,
		0, 89, 92, 5, 34, 0, 0, 90, 92, 8, 11, 0, 0, 91, 88, 1, 0, 0, 0, 91, 90,
		1, 0, 0, 0, 92, 95, 1, 0, 0, 0, 93, 91, 1, 0, 0, 0, 93, 94, 1, 0, 0, 0,
		94, 96, 1, 0, 0, 0, 95, 93, 1, 0, 0, 0, 96, 108, 5, 34, 0, 0, 97, 103,
		5, 39, 0, 0, 98, 99, 5, 92, 0, 0, 99, 102, 5, 39, 0, 0, 100, 102, 8, 12,
		0, 0, 101, 98, 1, 0, 0, 0, 101, 100, 1, 0, 0, 0, 102, 105, 1, 0, 0, 0,
		103, 101, 1, 0, 0, 0, 103, 104, 1, 0, 0, 0, 104, 106, 1, 0, 0, 0, 105,
		103, 1, 0, 0, 0, 106, 108, 5, 39, 0, 0, 107, 87, 1, 0, 0, 0, 107, 97, 1,
		0, 0, 0, 108, 120, 1, 0, 0, 0, 109, 115, 5, 96, 0, 0, 110, 111, 5, 92,
		0, 0, 111, 114, 5, 96, 0, 0, 112, 114, 8, 13, 0, 0, 113, 110, 1, 0, 0,
		0, 113, 112, 1, 0, 0, 0, 114, 117, 1, 0, 0, 0, 115, 113, 1, 0, 0, 0, 115,
		116, 1, 0, 0, 0, 116, 118, 1, 0, 0, 0, 117, 115, 1, 0, 0, 0, 118, 120,
		5, 96, 0, 0, 119, 107, 1, 0, 0, 0, 119, 109, 1, 0, 0, 0, 120, 32, 1, 0,
		0, 0, 121, 123, 8, 14, 0, 0, 122, 121, 1, 0, 0, 0, 123, 124, 1, 0, 0, 0,
		124, 122, 1, 0, 0, 0, 124, 125, 1, 0, 0, 0, 125, 34, 1, 0, 0, 0, 126, 127,
		7, 15, 0, 0, 127, 36, 1, 0, 0, 0, 128, 130, 3, 35, 17, 0, 129, 128, 1,
		0, 0, 0, 130, 131, 1, 0, 0, 0, 131, 129, 1, 0, 0, 0, 131, 132, 1, 0, 0,
		0, 132, 133, 1, 0, 0, 0, 133, 134, 6, 18, 0, 0, 134, 38, 1, 0, 0, 0, 135,
		136, 9, 0, 0, 0, 136, 40, 1, 0, 0, 0, 12, 0, 85, 91, 93, 101, 103, 107,
		113, 115, 119, 124, 131, 1, 0, 1, 0,
	}
	deserializer := antlr.NewATNDeserializer(nil)
	staticData.atn = deserializer.Deserialize(staticData.serializedATN)
	atn := staticData.atn
	staticData.decisionToDFA = make([]*antlr.DFA, len(atn.DecisionToState))
	decisionToDFA := staticData.decisionToDFA
	for index, state := range atn.DecisionToState {
		decisionToDFA[index] = antlr.NewDFA(state, index)
	}
}

// SearchGrammarLexerInit initializes any static state used to implement SearchGrammarLexer. By default the
// static state used to implement the lexer is lazily initialized during the first call to
// NewSearchGrammarLexer(). You can call this function if you wish to initialize the static state ahead
// of time.
func SearchGrammarLexerInit() {
	staticData := &SearchGrammarLexerLexerStaticData
	staticData.once.Do(searchgrammarlexerLexerInit)
}

// NewSearchGrammarLexer produces a new lexer instance for the optional input antlr.CharStream.
func NewSearchGrammarLexer(input antlr.CharStream) *SearchGrammarLexer {
	SearchGrammarLexerInit()
	l := new(SearchGrammarLexer)
	l.BaseLexer = antlr.NewBaseLexer(input)
	staticData := &SearchGrammarLexerLexerStaticData
	l.Interpreter = antlr.NewLexerATNSimulator(l, staticData.atn, staticData.decisionToDFA, staticData.PredictionContextCache)
	l.channelNames = staticData.ChannelNames
	l.modeNames = staticData.ModeNames
	l.RuleNames = staticData.RuleNames
	l.LiteralNames = staticData.LiteralNames
	l.SymbolicNames = staticData.SymbolicNames
	l.GrammarFileName = "SearchGrammar.g4"
	// TODO: l.EOF = antlr.TokenEOF

	return l
}

// SearchGrammarLexer tokens.
const (
	SearchGrammarLexerAND              = 1
	SearchGrammarLexerOR               = 2
	SearchGrammarLexerNOT              = 3
	SearchGrammarLexerEXISTS           = 4
	SearchGrammarLexerBANG             = 5
	SearchGrammarLexerEQ               = 6
	SearchGrammarLexerNEQ              = 7
	SearchGrammarLexerLT               = 8
	SearchGrammarLexerLTE              = 9
	SearchGrammarLexerGT               = 10
	SearchGrammarLexerGTE              = 11
	SearchGrammarLexerLPAREN           = 12
	SearchGrammarLexerRPAREN           = 13
	SearchGrammarLexerCOLON            = 14
	SearchGrammarLexerID               = 15
	SearchGrammarLexerSTRING           = 16
	SearchGrammarLexerVALUE            = 17
	SearchGrammarLexerWS               = 18
	SearchGrammarLexerERROR_CHARACTERS = 19
)
