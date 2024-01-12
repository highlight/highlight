// Code generated from ./antlr/SearchGrammar.g4 by ANTLR 4.13.1. DO NOT EDIT.

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
		"", "'AND'", "'OR'", "'NOT'", "'='", "'!='", "'<'", "'<='", "'>'", "'>='",
		"'('", "')'", "':'",
	}
	staticData.SymbolicNames = []string{
		"", "AND", "OR", "NOT", "EQ", "NEQ", "LT", "LTE", "GT", "GTE", "LPAREN",
		"RPAREN", "COLON", "ID", "STRING", "VALUE", "WS", "ERROR_CHARACTERS",
	}
	staticData.RuleNames = []string{
		"AND", "OR", "NOT", "EQ", "NEQ", "LT", "LTE", "GT", "GTE", "LPAREN",
		"RPAREN", "COLON", "ID", "STRING", "VALUE", "WS", "ERROR_CHARACTERS",
	}
	staticData.PredictionContextCache = antlr.NewPredictionContextCache()
	staticData.serializedATN = []int32{
		4, 0, 17, 95, 6, -1, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2,
		4, 7, 4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2,
		10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7, 13, 2, 14, 7, 14, 2, 15,
		7, 15, 2, 16, 7, 16, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 1,
		2, 1, 2, 1, 2, 1, 3, 1, 3, 1, 4, 1, 4, 1, 4, 1, 5, 1, 5, 1, 6, 1, 6, 1,
		6, 1, 7, 1, 7, 1, 8, 1, 8, 1, 8, 1, 9, 1, 9, 1, 10, 1, 10, 1, 11, 1, 11,
		1, 12, 4, 12, 69, 8, 12, 11, 12, 12, 12, 70, 1, 13, 1, 13, 5, 13, 75, 8,
		13, 10, 13, 12, 13, 78, 9, 13, 1, 13, 1, 13, 1, 14, 4, 14, 83, 8, 14, 11,
		14, 12, 14, 84, 1, 15, 4, 15, 88, 8, 15, 11, 15, 12, 15, 89, 1, 15, 1,
		15, 1, 16, 1, 16, 1, 76, 0, 17, 1, 1, 3, 2, 5, 3, 7, 4, 9, 5, 11, 6, 13,
		7, 15, 8, 17, 9, 19, 10, 21, 11, 23, 12, 25, 13, 27, 14, 29, 15, 31, 16,
		33, 17, 1, 0, 3, 6, 0, 42, 42, 45, 46, 48, 57, 65, 90, 95, 95, 97, 122,
		6, 0, 9, 10, 12, 13, 32, 33, 40, 41, 58, 58, 60, 62, 3, 0, 9, 10, 12, 13,
		32, 32, 98, 0, 1, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 5, 1, 0, 0, 0, 0, 7,
		1, 0, 0, 0, 0, 9, 1, 0, 0, 0, 0, 11, 1, 0, 0, 0, 0, 13, 1, 0, 0, 0, 0,
		15, 1, 0, 0, 0, 0, 17, 1, 0, 0, 0, 0, 19, 1, 0, 0, 0, 0, 21, 1, 0, 0, 0,
		0, 23, 1, 0, 0, 0, 0, 25, 1, 0, 0, 0, 0, 27, 1, 0, 0, 0, 0, 29, 1, 0, 0,
		0, 0, 31, 1, 0, 0, 0, 0, 33, 1, 0, 0, 0, 1, 35, 1, 0, 0, 0, 3, 39, 1, 0,
		0, 0, 5, 42, 1, 0, 0, 0, 7, 46, 1, 0, 0, 0, 9, 48, 1, 0, 0, 0, 11, 51,
		1, 0, 0, 0, 13, 53, 1, 0, 0, 0, 15, 56, 1, 0, 0, 0, 17, 58, 1, 0, 0, 0,
		19, 61, 1, 0, 0, 0, 21, 63, 1, 0, 0, 0, 23, 65, 1, 0, 0, 0, 25, 68, 1,
		0, 0, 0, 27, 72, 1, 0, 0, 0, 29, 82, 1, 0, 0, 0, 31, 87, 1, 0, 0, 0, 33,
		93, 1, 0, 0, 0, 35, 36, 5, 65, 0, 0, 36, 37, 5, 78, 0, 0, 37, 38, 5, 68,
		0, 0, 38, 2, 1, 0, 0, 0, 39, 40, 5, 79, 0, 0, 40, 41, 5, 82, 0, 0, 41,
		4, 1, 0, 0, 0, 42, 43, 5, 78, 0, 0, 43, 44, 5, 79, 0, 0, 44, 45, 5, 84,
		0, 0, 45, 6, 1, 0, 0, 0, 46, 47, 5, 61, 0, 0, 47, 8, 1, 0, 0, 0, 48, 49,
		5, 33, 0, 0, 49, 50, 5, 61, 0, 0, 50, 10, 1, 0, 0, 0, 51, 52, 5, 60, 0,
		0, 52, 12, 1, 0, 0, 0, 53, 54, 5, 60, 0, 0, 54, 55, 5, 61, 0, 0, 55, 14,
		1, 0, 0, 0, 56, 57, 5, 62, 0, 0, 57, 16, 1, 0, 0, 0, 58, 59, 5, 62, 0,
		0, 59, 60, 5, 61, 0, 0, 60, 18, 1, 0, 0, 0, 61, 62, 5, 40, 0, 0, 62, 20,
		1, 0, 0, 0, 63, 64, 5, 41, 0, 0, 64, 22, 1, 0, 0, 0, 65, 66, 5, 58, 0,
		0, 66, 24, 1, 0, 0, 0, 67, 69, 7, 0, 0, 0, 68, 67, 1, 0, 0, 0, 69, 70,
		1, 0, 0, 0, 70, 68, 1, 0, 0, 0, 70, 71, 1, 0, 0, 0, 71, 26, 1, 0, 0, 0,
		72, 76, 5, 34, 0, 0, 73, 75, 9, 0, 0, 0, 74, 73, 1, 0, 0, 0, 75, 78, 1,
		0, 0, 0, 76, 77, 1, 0, 0, 0, 76, 74, 1, 0, 0, 0, 77, 79, 1, 0, 0, 0, 78,
		76, 1, 0, 0, 0, 79, 80, 5, 34, 0, 0, 80, 28, 1, 0, 0, 0, 81, 83, 8, 1,
		0, 0, 82, 81, 1, 0, 0, 0, 83, 84, 1, 0, 0, 0, 84, 82, 1, 0, 0, 0, 84, 85,
		1, 0, 0, 0, 85, 30, 1, 0, 0, 0, 86, 88, 7, 2, 0, 0, 87, 86, 1, 0, 0, 0,
		88, 89, 1, 0, 0, 0, 89, 87, 1, 0, 0, 0, 89, 90, 1, 0, 0, 0, 90, 91, 1,
		0, 0, 0, 91, 92, 6, 15, 0, 0, 92, 32, 1, 0, 0, 0, 93, 94, 9, 0, 0, 0, 94,
		34, 1, 0, 0, 0, 5, 0, 70, 76, 84, 89, 1, 6, 0, 0,
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
	SearchGrammarLexerEQ               = 4
	SearchGrammarLexerNEQ              = 5
	SearchGrammarLexerLT               = 6
	SearchGrammarLexerLTE              = 7
	SearchGrammarLexerGT               = 8
	SearchGrammarLexerGTE              = 9
	SearchGrammarLexerLPAREN           = 10
	SearchGrammarLexerRPAREN           = 11
	SearchGrammarLexerCOLON            = 12
	SearchGrammarLexerID               = 13
	SearchGrammarLexerSTRING           = 14
	SearchGrammarLexerVALUE            = 15
	SearchGrammarLexerWS               = 16
	SearchGrammarLexerERROR_CHARACTERS = 17
)
