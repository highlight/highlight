// Code generated from ./antlr/SearchGrammar.g4 by ANTLR 4.13.1. DO NOT EDIT.

package parser // SearchGrammar

import (
	"fmt"
	"strconv"
	"sync"

	"github.com/antlr4-go/antlr/v4"
)

// Suppress unused import errors
var _ = fmt.Printf
var _ = strconv.Itoa
var _ = sync.Once{}

type SearchGrammarParser struct {
	*antlr.BaseParser
}

var SearchGrammarParserStaticData struct {
	once                   sync.Once
	serializedATN          []int32
	LiteralNames           []string
	SymbolicNames          []string
	RuleNames              []string
	PredictionContextCache *antlr.PredictionContextCache
	atn                    *antlr.ATN
	decisionToDFA          []*antlr.DFA
}

func searchgrammarParserInit() {
	staticData := &SearchGrammarParserStaticData
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
		"search_query", "top_col_expr", "col_expr", "search_expr", "search_key",
		"and_op", "implicit_and_op", "or_op", "exists_op", "negation_op", "bin_op",
		"search_value",
	}
	staticData.PredictionContextCache = antlr.NewPredictionContextCache()
	staticData.serializedATN = []int32{
		4, 1, 19, 117, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7,
		4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2, 10, 7,
		10, 2, 11, 7, 11, 1, 0, 1, 0, 1, 0, 1, 0, 3, 0, 29, 8, 0, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 39, 8, 1, 1, 2, 1, 2, 1, 2, 1, 2,
		1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 3, 2, 50, 8, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1,
		2, 1, 2, 5, 2, 58, 8, 2, 10, 2, 12, 2, 61, 9, 2, 1, 3, 1, 3, 1, 3, 1, 3,
		1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3,
		3, 3, 79, 8, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1,
		3, 1, 3, 1, 3, 5, 3, 93, 8, 3, 10, 3, 12, 3, 96, 9, 3, 1, 4, 1, 4, 1, 5,
		1, 5, 1, 6, 1, 6, 1, 7, 1, 7, 1, 8, 1, 8, 1, 8, 3, 8, 109, 8, 8, 1, 9,
		1, 9, 1, 10, 1, 10, 1, 11, 1, 11, 1, 11, 0, 2, 4, 6, 12, 0, 2, 4, 6, 8,
		10, 12, 14, 16, 18, 20, 22, 0, 2, 2, 0, 5, 11, 14, 14, 1, 0, 15, 17, 119,
		0, 28, 1, 0, 0, 0, 2, 38, 1, 0, 0, 0, 4, 49, 1, 0, 0, 0, 6, 78, 1, 0, 0,
		0, 8, 97, 1, 0, 0, 0, 10, 99, 1, 0, 0, 0, 12, 101, 1, 0, 0, 0, 14, 103,
		1, 0, 0, 0, 16, 108, 1, 0, 0, 0, 18, 110, 1, 0, 0, 0, 20, 112, 1, 0, 0,
		0, 22, 114, 1, 0, 0, 0, 24, 29, 5, 0, 0, 1, 25, 26, 3, 6, 3, 0, 26, 27,
		5, 0, 0, 1, 27, 29, 1, 0, 0, 0, 28, 24, 1, 0, 0, 0, 28, 25, 1, 0, 0, 0,
		29, 1, 1, 0, 0, 0, 30, 31, 5, 12, 0, 0, 31, 32, 3, 4, 2, 0, 32, 33, 5,
		13, 0, 0, 33, 39, 1, 0, 0, 0, 34, 35, 3, 18, 9, 0, 35, 36, 3, 2, 1, 0,
		36, 39, 1, 0, 0, 0, 37, 39, 3, 22, 11, 0, 38, 30, 1, 0, 0, 0, 38, 34, 1,
		0, 0, 0, 38, 37, 1, 0, 0, 0, 39, 3, 1, 0, 0, 0, 40, 41, 6, 2, -1, 0, 41,
		42, 5, 12, 0, 0, 42, 43, 3, 4, 2, 0, 43, 44, 5, 13, 0, 0, 44, 50, 1, 0,
		0, 0, 45, 46, 3, 18, 9, 0, 46, 47, 3, 4, 2, 4, 47, 50, 1, 0, 0, 0, 48,
		50, 3, 22, 11, 0, 49, 40, 1, 0, 0, 0, 49, 45, 1, 0, 0, 0, 49, 48, 1, 0,
		0, 0, 50, 59, 1, 0, 0, 0, 51, 52, 10, 3, 0, 0, 52, 53, 5, 1, 0, 0, 53,
		58, 3, 4, 2, 4, 54, 55, 10, 2, 0, 0, 55, 56, 5, 2, 0, 0, 56, 58, 3, 4,
		2, 3, 57, 51, 1, 0, 0, 0, 57, 54, 1, 0, 0, 0, 58, 61, 1, 0, 0, 0, 59, 57,
		1, 0, 0, 0, 59, 60, 1, 0, 0, 0, 60, 5, 1, 0, 0, 0, 61, 59, 1, 0, 0, 0,
		62, 63, 6, 3, -1, 0, 63, 64, 5, 12, 0, 0, 64, 65, 3, 6, 3, 0, 65, 66, 5,
		13, 0, 0, 66, 79, 1, 0, 0, 0, 67, 68, 3, 18, 9, 0, 68, 69, 3, 6, 3, 7,
		69, 79, 1, 0, 0, 0, 70, 71, 3, 8, 4, 0, 71, 72, 3, 20, 10, 0, 72, 73, 3,
		2, 1, 0, 73, 79, 1, 0, 0, 0, 74, 75, 3, 8, 4, 0, 75, 76, 3, 16, 8, 0, 76,
		79, 1, 0, 0, 0, 77, 79, 3, 2, 1, 0, 78, 62, 1, 0, 0, 0, 78, 67, 1, 0, 0,
		0, 78, 70, 1, 0, 0, 0, 78, 74, 1, 0, 0, 0, 78, 77, 1, 0, 0, 0, 79, 94,
		1, 0, 0, 0, 80, 81, 10, 6, 0, 0, 81, 82, 3, 10, 5, 0, 82, 83, 3, 6, 3,
		7, 83, 93, 1, 0, 0, 0, 84, 85, 10, 5, 0, 0, 85, 86, 3, 14, 7, 0, 86, 87,
		3, 6, 3, 6, 87, 93, 1, 0, 0, 0, 88, 89, 10, 4, 0, 0, 89, 90, 3, 12, 6,
		0, 90, 91, 3, 6, 3, 5, 91, 93, 1, 0, 0, 0, 92, 80, 1, 0, 0, 0, 92, 84,
		1, 0, 0, 0, 92, 88, 1, 0, 0, 0, 93, 96, 1, 0, 0, 0, 94, 92, 1, 0, 0, 0,
		94, 95, 1, 0, 0, 0, 95, 7, 1, 0, 0, 0, 96, 94, 1, 0, 0, 0, 97, 98, 5, 15,
		0, 0, 98, 9, 1, 0, 0, 0, 99, 100, 5, 1, 0, 0, 100, 11, 1, 0, 0, 0, 101,
		102, 1, 0, 0, 0, 102, 13, 1, 0, 0, 0, 103, 104, 5, 2, 0, 0, 104, 15, 1,
		0, 0, 0, 105, 109, 5, 4, 0, 0, 106, 107, 5, 3, 0, 0, 107, 109, 5, 4, 0,
		0, 108, 105, 1, 0, 0, 0, 108, 106, 1, 0, 0, 0, 109, 17, 1, 0, 0, 0, 110,
		111, 5, 3, 0, 0, 111, 19, 1, 0, 0, 0, 112, 113, 7, 0, 0, 0, 113, 21, 1,
		0, 0, 0, 114, 115, 7, 1, 0, 0, 115, 23, 1, 0, 0, 0, 9, 28, 38, 49, 57,
		59, 78, 92, 94, 108,
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

// SearchGrammarParserInit initializes any static state used to implement SearchGrammarParser. By default the
// static state used to implement the parser is lazily initialized during the first call to
// NewSearchGrammarParser(). You can call this function if you wish to initialize the static state ahead
// of time.
func SearchGrammarParserInit() {
	staticData := &SearchGrammarParserStaticData
	staticData.once.Do(searchgrammarParserInit)
}

// NewSearchGrammarParser produces a new parser instance for the optional input antlr.TokenStream.
func NewSearchGrammarParser(input antlr.TokenStream) *SearchGrammarParser {
	SearchGrammarParserInit()
	this := new(SearchGrammarParser)
	this.BaseParser = antlr.NewBaseParser(input)
	staticData := &SearchGrammarParserStaticData
	this.Interpreter = antlr.NewParserATNSimulator(this, staticData.atn, staticData.decisionToDFA, staticData.PredictionContextCache)
	this.RuleNames = staticData.RuleNames
	this.LiteralNames = staticData.LiteralNames
	this.SymbolicNames = staticData.SymbolicNames
	this.GrammarFileName = "SearchGrammar.g4"

	return this
}

// SearchGrammarParser tokens.
const (
	SearchGrammarParserEOF              = antlr.TokenEOF
	SearchGrammarParserAND              = 1
	SearchGrammarParserOR               = 2
	SearchGrammarParserNOT              = 3
	SearchGrammarParserEXISTS           = 4
	SearchGrammarParserBANG             = 5
	SearchGrammarParserEQ               = 6
	SearchGrammarParserNEQ              = 7
	SearchGrammarParserLT               = 8
	SearchGrammarParserLTE              = 9
	SearchGrammarParserGT               = 10
	SearchGrammarParserGTE              = 11
	SearchGrammarParserLPAREN           = 12
	SearchGrammarParserRPAREN           = 13
	SearchGrammarParserCOLON            = 14
	SearchGrammarParserID               = 15
	SearchGrammarParserSTRING           = 16
	SearchGrammarParserVALUE            = 17
	SearchGrammarParserWS               = 18
	SearchGrammarParserERROR_CHARACTERS = 19
)

// SearchGrammarParser rules.
const (
	SearchGrammarParserRULE_search_query    = 0
	SearchGrammarParserRULE_top_col_expr    = 1
	SearchGrammarParserRULE_col_expr        = 2
	SearchGrammarParserRULE_search_expr     = 3
	SearchGrammarParserRULE_search_key      = 4
	SearchGrammarParserRULE_and_op          = 5
	SearchGrammarParserRULE_implicit_and_op = 6
	SearchGrammarParserRULE_or_op           = 7
	SearchGrammarParserRULE_exists_op       = 8
	SearchGrammarParserRULE_negation_op     = 9
	SearchGrammarParserRULE_bin_op          = 10
	SearchGrammarParserRULE_search_value    = 11
)

// ISearch_queryContext is an interface to support dynamic dispatch.
type ISearch_queryContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser

	// Getter signatures
	EOF() antlr.TerminalNode
	Search_expr() ISearch_exprContext

	// IsSearch_queryContext differentiates from other interfaces.
	IsSearch_queryContext()
}

type Search_queryContext struct {
	antlr.BaseParserRuleContext
	parser antlr.Parser
}

func NewEmptySearch_queryContext() *Search_queryContext {
	var p = new(Search_queryContext)
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_search_query
	return p
}

func InitEmptySearch_queryContext(p *Search_queryContext) {
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_search_query
}

func (*Search_queryContext) IsSearch_queryContext() {}

func NewSearch_queryContext(parser antlr.Parser, parent antlr.ParserRuleContext, invokingState int) *Search_queryContext {
	var p = new(Search_queryContext)

	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, parent, invokingState)

	p.parser = parser
	p.RuleIndex = SearchGrammarParserRULE_search_query

	return p
}

func (s *Search_queryContext) GetParser() antlr.Parser { return s.parser }

func (s *Search_queryContext) EOF() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserEOF, 0)
}

func (s *Search_queryContext) Search_expr() ISearch_exprContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ISearch_exprContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ISearch_exprContext)
}

func (s *Search_queryContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Search_queryContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

func (s *Search_queryContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterSearch_query(s)
	}
}

func (s *Search_queryContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitSearch_query(s)
	}
}

func (p *SearchGrammarParser) Search_query() (localctx ISearch_queryContext) {
	localctx = NewSearch_queryContext(p, p.GetParserRuleContext(), p.GetState())
	p.EnterRule(localctx, 0, SearchGrammarParserRULE_search_query)
	p.SetState(28)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}

	switch p.GetTokenStream().LA(1) {
	case SearchGrammarParserEOF:
		p.EnterOuterAlt(localctx, 1)
		{
			p.SetState(24)
			p.Match(SearchGrammarParserEOF)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	case SearchGrammarParserNOT, SearchGrammarParserLPAREN, SearchGrammarParserID, SearchGrammarParserSTRING, SearchGrammarParserVALUE:
		p.EnterOuterAlt(localctx, 2)
		{
			p.SetState(25)
			p.search_expr(0)
		}
		{
			p.SetState(26)
			p.Match(SearchGrammarParserEOF)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	default:
		p.SetError(antlr.NewNoViableAltException(p, nil, nil, nil, nil, nil))
		goto errorExit
	}

errorExit:
	if p.HasError() {
		v := p.GetError()
		localctx.SetException(v)
		p.GetErrorHandler().ReportError(p, v)
		p.GetErrorHandler().Recover(p, v)
		p.SetError(nil)
	}
	p.ExitRule()
	return localctx
	goto errorExit // Trick to prevent compiler error if the label is not used
}

// ITop_col_exprContext is an interface to support dynamic dispatch.
type ITop_col_exprContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser
	// IsTop_col_exprContext differentiates from other interfaces.
	IsTop_col_exprContext()
}

type Top_col_exprContext struct {
	antlr.BaseParserRuleContext
	parser antlr.Parser
}

func NewEmptyTop_col_exprContext() *Top_col_exprContext {
	var p = new(Top_col_exprContext)
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_top_col_expr
	return p
}

func InitEmptyTop_col_exprContext(p *Top_col_exprContext) {
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_top_col_expr
}

func (*Top_col_exprContext) IsTop_col_exprContext() {}

func NewTop_col_exprContext(parser antlr.Parser, parent antlr.ParserRuleContext, invokingState int) *Top_col_exprContext {
	var p = new(Top_col_exprContext)

	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, parent, invokingState)

	p.parser = parser
	p.RuleIndex = SearchGrammarParserRULE_top_col_expr

	return p
}

func (s *Top_col_exprContext) GetParser() antlr.Parser { return s.parser }

func (s *Top_col_exprContext) CopyAll(ctx *Top_col_exprContext) {
	s.CopyFrom(&ctx.BaseParserRuleContext)
}

func (s *Top_col_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Top_col_exprContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

type Negated_top_col_exprContext struct {
	Top_col_exprContext
}

func NewNegated_top_col_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Negated_top_col_exprContext {
	var p = new(Negated_top_col_exprContext)

	InitEmptyTop_col_exprContext(&p.Top_col_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Top_col_exprContext))

	return p
}

func (s *Negated_top_col_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Negated_top_col_exprContext) Negation_op() INegation_opContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(INegation_opContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(INegation_opContext)
}

func (s *Negated_top_col_exprContext) Top_col_expr() ITop_col_exprContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ITop_col_exprContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ITop_col_exprContext)
}

func (s *Negated_top_col_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterNegated_top_col_expr(s)
	}
}

func (s *Negated_top_col_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitNegated_top_col_expr(s)
	}
}

type Top_paren_col_exprContext struct {
	Top_col_exprContext
}

func NewTop_paren_col_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Top_paren_col_exprContext {
	var p = new(Top_paren_col_exprContext)

	InitEmptyTop_col_exprContext(&p.Top_col_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Top_col_exprContext))

	return p
}

func (s *Top_paren_col_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Top_paren_col_exprContext) LPAREN() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserLPAREN, 0)
}

func (s *Top_paren_col_exprContext) Col_expr() ICol_exprContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ICol_exprContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ICol_exprContext)
}

func (s *Top_paren_col_exprContext) RPAREN() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserRPAREN, 0)
}

func (s *Top_paren_col_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterTop_paren_col_expr(s)
	}
}

func (s *Top_paren_col_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitTop_paren_col_expr(s)
	}
}

type Top_col_search_valueContext struct {
	Top_col_exprContext
}

func NewTop_col_search_valueContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Top_col_search_valueContext {
	var p = new(Top_col_search_valueContext)

	InitEmptyTop_col_exprContext(&p.Top_col_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Top_col_exprContext))

	return p
}

func (s *Top_col_search_valueContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Top_col_search_valueContext) Search_value() ISearch_valueContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ISearch_valueContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ISearch_valueContext)
}

func (s *Top_col_search_valueContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterTop_col_search_value(s)
	}
}

func (s *Top_col_search_valueContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitTop_col_search_value(s)
	}
}

func (p *SearchGrammarParser) Top_col_expr() (localctx ITop_col_exprContext) {
	localctx = NewTop_col_exprContext(p, p.GetParserRuleContext(), p.GetState())
	p.EnterRule(localctx, 2, SearchGrammarParserRULE_top_col_expr)
	p.SetState(38)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}

	switch p.GetTokenStream().LA(1) {
	case SearchGrammarParserLPAREN:
		localctx = NewTop_paren_col_exprContext(p, localctx)
		p.EnterOuterAlt(localctx, 1)
		{
			p.SetState(30)
			p.Match(SearchGrammarParserLPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}
		{
			p.SetState(31)
			p.col_expr(0)
		}
		{
			p.SetState(32)
			p.Match(SearchGrammarParserRPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	case SearchGrammarParserNOT:
		localctx = NewNegated_top_col_exprContext(p, localctx)
		p.EnterOuterAlt(localctx, 2)
		{
			p.SetState(34)
			p.Negation_op()
		}
		{
			p.SetState(35)
			p.Top_col_expr()
		}

	case SearchGrammarParserID, SearchGrammarParserSTRING, SearchGrammarParserVALUE:
		localctx = NewTop_col_search_valueContext(p, localctx)
		p.EnterOuterAlt(localctx, 3)
		{
			p.SetState(37)
			p.Search_value()
		}

	default:
		p.SetError(antlr.NewNoViableAltException(p, nil, nil, nil, nil, nil))
		goto errorExit
	}

errorExit:
	if p.HasError() {
		v := p.GetError()
		localctx.SetException(v)
		p.GetErrorHandler().ReportError(p, v)
		p.GetErrorHandler().Recover(p, v)
		p.SetError(nil)
	}
	p.ExitRule()
	return localctx
	goto errorExit // Trick to prevent compiler error if the label is not used
}

// ICol_exprContext is an interface to support dynamic dispatch.
type ICol_exprContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser
	// IsCol_exprContext differentiates from other interfaces.
	IsCol_exprContext()
}

type Col_exprContext struct {
	antlr.BaseParserRuleContext
	parser antlr.Parser
}

func NewEmptyCol_exprContext() *Col_exprContext {
	var p = new(Col_exprContext)
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_col_expr
	return p
}

func InitEmptyCol_exprContext(p *Col_exprContext) {
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_col_expr
}

func (*Col_exprContext) IsCol_exprContext() {}

func NewCol_exprContext(parser antlr.Parser, parent antlr.ParserRuleContext, invokingState int) *Col_exprContext {
	var p = new(Col_exprContext)

	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, parent, invokingState)

	p.parser = parser
	p.RuleIndex = SearchGrammarParserRULE_col_expr

	return p
}

func (s *Col_exprContext) GetParser() antlr.Parser { return s.parser }

func (s *Col_exprContext) CopyAll(ctx *Col_exprContext) {
	s.CopyFrom(&ctx.BaseParserRuleContext)
}

func (s *Col_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Col_exprContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

type Or_col_exprContext struct {
	Col_exprContext
}

func NewOr_col_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Or_col_exprContext {
	var p = new(Or_col_exprContext)

	InitEmptyCol_exprContext(&p.Col_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Col_exprContext))

	return p
}

func (s *Or_col_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Or_col_exprContext) AllCol_expr() []ICol_exprContext {
	children := s.GetChildren()
	len := 0
	for _, ctx := range children {
		if _, ok := ctx.(ICol_exprContext); ok {
			len++
		}
	}

	tst := make([]ICol_exprContext, len)
	i := 0
	for _, ctx := range children {
		if t, ok := ctx.(ICol_exprContext); ok {
			tst[i] = t.(ICol_exprContext)
			i++
		}
	}

	return tst
}

func (s *Or_col_exprContext) Col_expr(i int) ICol_exprContext {
	var t antlr.RuleContext
	j := 0
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ICol_exprContext); ok {
			if j == i {
				t = ctx.(antlr.RuleContext)
				break
			}
			j++
		}
	}

	if t == nil {
		return nil
	}

	return t.(ICol_exprContext)
}

func (s *Or_col_exprContext) OR() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserOR, 0)
}

func (s *Or_col_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterOr_col_expr(s)
	}
}

func (s *Or_col_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitOr_col_expr(s)
	}
}

type Col_paren_exprContext struct {
	Col_exprContext
}

func NewCol_paren_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Col_paren_exprContext {
	var p = new(Col_paren_exprContext)

	InitEmptyCol_exprContext(&p.Col_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Col_exprContext))

	return p
}

func (s *Col_paren_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Col_paren_exprContext) LPAREN() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserLPAREN, 0)
}

func (s *Col_paren_exprContext) Col_expr() ICol_exprContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ICol_exprContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ICol_exprContext)
}

func (s *Col_paren_exprContext) RPAREN() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserRPAREN, 0)
}

func (s *Col_paren_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterCol_paren_expr(s)
	}
}

func (s *Col_paren_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitCol_paren_expr(s)
	}
}

type And_col_exprContext struct {
	Col_exprContext
}

func NewAnd_col_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *And_col_exprContext {
	var p = new(And_col_exprContext)

	InitEmptyCol_exprContext(&p.Col_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Col_exprContext))

	return p
}

func (s *And_col_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *And_col_exprContext) AllCol_expr() []ICol_exprContext {
	children := s.GetChildren()
	len := 0
	for _, ctx := range children {
		if _, ok := ctx.(ICol_exprContext); ok {
			len++
		}
	}

	tst := make([]ICol_exprContext, len)
	i := 0
	for _, ctx := range children {
		if t, ok := ctx.(ICol_exprContext); ok {
			tst[i] = t.(ICol_exprContext)
			i++
		}
	}

	return tst
}

func (s *And_col_exprContext) Col_expr(i int) ICol_exprContext {
	var t antlr.RuleContext
	j := 0
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ICol_exprContext); ok {
			if j == i {
				t = ctx.(antlr.RuleContext)
				break
			}
			j++
		}
	}

	if t == nil {
		return nil
	}

	return t.(ICol_exprContext)
}

func (s *And_col_exprContext) AND() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserAND, 0)
}

func (s *And_col_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterAnd_col_expr(s)
	}
}

func (s *And_col_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitAnd_col_expr(s)
	}
}

type Negated_col_exprContext struct {
	Col_exprContext
}

func NewNegated_col_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Negated_col_exprContext {
	var p = new(Negated_col_exprContext)

	InitEmptyCol_exprContext(&p.Col_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Col_exprContext))

	return p
}

func (s *Negated_col_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Negated_col_exprContext) Negation_op() INegation_opContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(INegation_opContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(INegation_opContext)
}

func (s *Negated_col_exprContext) Col_expr() ICol_exprContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ICol_exprContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ICol_exprContext)
}

func (s *Negated_col_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterNegated_col_expr(s)
	}
}

func (s *Negated_col_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitNegated_col_expr(s)
	}
}

type Col_search_valueContext struct {
	Col_exprContext
}

func NewCol_search_valueContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Col_search_valueContext {
	var p = new(Col_search_valueContext)

	InitEmptyCol_exprContext(&p.Col_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Col_exprContext))

	return p
}

func (s *Col_search_valueContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Col_search_valueContext) Search_value() ISearch_valueContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ISearch_valueContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ISearch_valueContext)
}

func (s *Col_search_valueContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterCol_search_value(s)
	}
}

func (s *Col_search_valueContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitCol_search_value(s)
	}
}

func (p *SearchGrammarParser) Col_expr() (localctx ICol_exprContext) {
	return p.col_expr(0)
}

func (p *SearchGrammarParser) col_expr(_p int) (localctx ICol_exprContext) {
	var _parentctx antlr.ParserRuleContext = p.GetParserRuleContext()

	_parentState := p.GetState()
	localctx = NewCol_exprContext(p, p.GetParserRuleContext(), _parentState)
	var _prevctx ICol_exprContext = localctx
	var _ antlr.ParserRuleContext = _prevctx // TODO: To prevent unused variable warning.
	_startState := 4
	p.EnterRecursionRule(localctx, 4, SearchGrammarParserRULE_col_expr, _p)
	var _alt int

	p.EnterOuterAlt(localctx, 1)
	p.SetState(49)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}

	switch p.GetTokenStream().LA(1) {
	case SearchGrammarParserLPAREN:
		localctx = NewCol_paren_exprContext(p, localctx)
		p.SetParserRuleContext(localctx)
		_prevctx = localctx

		{
			p.SetState(41)
			p.Match(SearchGrammarParserLPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}
		{
			p.SetState(42)
			p.col_expr(0)
		}
		{
			p.SetState(43)
			p.Match(SearchGrammarParserRPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	case SearchGrammarParserNOT:
		localctx = NewNegated_col_exprContext(p, localctx)
		p.SetParserRuleContext(localctx)
		_prevctx = localctx
		{
			p.SetState(45)
			p.Negation_op()
		}
		{
			p.SetState(46)
			p.col_expr(4)
		}

	case SearchGrammarParserID, SearchGrammarParserSTRING, SearchGrammarParserVALUE:
		localctx = NewCol_search_valueContext(p, localctx)
		p.SetParserRuleContext(localctx)
		_prevctx = localctx
		{
			p.SetState(48)
			p.Search_value()
		}

	default:
		p.SetError(antlr.NewNoViableAltException(p, nil, nil, nil, nil, nil))
		goto errorExit
	}
	p.GetParserRuleContext().SetStop(p.GetTokenStream().LT(-1))
	p.SetState(59)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}
	_alt = p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 4, p.GetParserRuleContext())
	if p.HasError() {
		goto errorExit
	}
	for _alt != 2 && _alt != antlr.ATNInvalidAltNumber {
		if _alt == 1 {
			if p.GetParseListeners() != nil {
				p.TriggerExitRuleEvent()
			}
			_prevctx = localctx
			p.SetState(57)
			p.GetErrorHandler().Sync(p)
			if p.HasError() {
				goto errorExit
			}

			switch p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 3, p.GetParserRuleContext()) {
			case 1:
				localctx = NewAnd_col_exprContext(p, NewCol_exprContext(p, _parentctx, _parentState))
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_col_expr)
				p.SetState(51)

				if !(p.Precpred(p.GetParserRuleContext(), 3)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 3)", ""))
					goto errorExit
				}
				{
					p.SetState(52)
					p.Match(SearchGrammarParserAND)
					if p.HasError() {
						// Recognition error - abort rule
						goto errorExit
					}
				}
				{
					p.SetState(53)
					p.col_expr(4)
				}

			case 2:
				localctx = NewOr_col_exprContext(p, NewCol_exprContext(p, _parentctx, _parentState))
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_col_expr)
				p.SetState(54)

				if !(p.Precpred(p.GetParserRuleContext(), 2)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 2)", ""))
					goto errorExit
				}
				{
					p.SetState(55)
					p.Match(SearchGrammarParserOR)
					if p.HasError() {
						// Recognition error - abort rule
						goto errorExit
					}
				}
				{
					p.SetState(56)
					p.col_expr(3)
				}

			case antlr.ATNInvalidAltNumber:
				goto errorExit
			}

		}
		p.SetState(61)
		p.GetErrorHandler().Sync(p)
		if p.HasError() {
			goto errorExit
		}
		_alt = p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 4, p.GetParserRuleContext())
		if p.HasError() {
			goto errorExit
		}
	}

errorExit:
	if p.HasError() {
		v := p.GetError()
		localctx.SetException(v)
		p.GetErrorHandler().ReportError(p, v)
		p.GetErrorHandler().Recover(p, v)
		p.SetError(nil)
	}
	p.UnrollRecursionContexts(_parentctx)
	return localctx
	goto errorExit // Trick to prevent compiler error if the label is not used
}

// ISearch_exprContext is an interface to support dynamic dispatch.
type ISearch_exprContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser
	// IsSearch_exprContext differentiates from other interfaces.
	IsSearch_exprContext()
}

type Search_exprContext struct {
	antlr.BaseParserRuleContext
	parser antlr.Parser
}

func NewEmptySearch_exprContext() *Search_exprContext {
	var p = new(Search_exprContext)
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_search_expr
	return p
}

func InitEmptySearch_exprContext(p *Search_exprContext) {
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_search_expr
}

func (*Search_exprContext) IsSearch_exprContext() {}

func NewSearch_exprContext(parser antlr.Parser, parent antlr.ParserRuleContext, invokingState int) *Search_exprContext {
	var p = new(Search_exprContext)

	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, parent, invokingState)

	p.parser = parser
	p.RuleIndex = SearchGrammarParserRULE_search_expr

	return p
}

func (s *Search_exprContext) GetParser() antlr.Parser { return s.parser }

func (s *Search_exprContext) CopyAll(ctx *Search_exprContext) {
	s.CopyFrom(&ctx.BaseParserRuleContext)
}

func (s *Search_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Search_exprContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

type Negated_search_exprContext struct {
	Search_exprContext
}

func NewNegated_search_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Negated_search_exprContext {
	var p = new(Negated_search_exprContext)

	InitEmptySearch_exprContext(&p.Search_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Search_exprContext))

	return p
}

func (s *Negated_search_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Negated_search_exprContext) Negation_op() INegation_opContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(INegation_opContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(INegation_opContext)
}

func (s *Negated_search_exprContext) Search_expr() ISearch_exprContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ISearch_exprContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ISearch_exprContext)
}

func (s *Negated_search_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterNegated_search_expr(s)
	}
}

func (s *Negated_search_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitNegated_search_expr(s)
	}
}

type Body_search_exprContext struct {
	Search_exprContext
}

func NewBody_search_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Body_search_exprContext {
	var p = new(Body_search_exprContext)

	InitEmptySearch_exprContext(&p.Search_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Search_exprContext))

	return p
}

func (s *Body_search_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Body_search_exprContext) Top_col_expr() ITop_col_exprContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ITop_col_exprContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ITop_col_exprContext)
}

func (s *Body_search_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterBody_search_expr(s)
	}
}

func (s *Body_search_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitBody_search_expr(s)
	}
}

type And_search_exprContext struct {
	Search_exprContext
}

func NewAnd_search_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *And_search_exprContext {
	var p = new(And_search_exprContext)

	InitEmptySearch_exprContext(&p.Search_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Search_exprContext))

	return p
}

func (s *And_search_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *And_search_exprContext) AllSearch_expr() []ISearch_exprContext {
	children := s.GetChildren()
	len := 0
	for _, ctx := range children {
		if _, ok := ctx.(ISearch_exprContext); ok {
			len++
		}
	}

	tst := make([]ISearch_exprContext, len)
	i := 0
	for _, ctx := range children {
		if t, ok := ctx.(ISearch_exprContext); ok {
			tst[i] = t.(ISearch_exprContext)
			i++
		}
	}

	return tst
}

func (s *And_search_exprContext) Search_expr(i int) ISearch_exprContext {
	var t antlr.RuleContext
	j := 0
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ISearch_exprContext); ok {
			if j == i {
				t = ctx.(antlr.RuleContext)
				break
			}
			j++
		}
	}

	if t == nil {
		return nil
	}

	return t.(ISearch_exprContext)
}

func (s *And_search_exprContext) And_op() IAnd_opContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(IAnd_opContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(IAnd_opContext)
}

func (s *And_search_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterAnd_search_expr(s)
	}
}

func (s *And_search_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitAnd_search_expr(s)
	}
}

type Or_search_exprContext struct {
	Search_exprContext
}

func NewOr_search_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Or_search_exprContext {
	var p = new(Or_search_exprContext)

	InitEmptySearch_exprContext(&p.Search_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Search_exprContext))

	return p
}

func (s *Or_search_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Or_search_exprContext) AllSearch_expr() []ISearch_exprContext {
	children := s.GetChildren()
	len := 0
	for _, ctx := range children {
		if _, ok := ctx.(ISearch_exprContext); ok {
			len++
		}
	}

	tst := make([]ISearch_exprContext, len)
	i := 0
	for _, ctx := range children {
		if t, ok := ctx.(ISearch_exprContext); ok {
			tst[i] = t.(ISearch_exprContext)
			i++
		}
	}

	return tst
}

func (s *Or_search_exprContext) Search_expr(i int) ISearch_exprContext {
	var t antlr.RuleContext
	j := 0
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ISearch_exprContext); ok {
			if j == i {
				t = ctx.(antlr.RuleContext)
				break
			}
			j++
		}
	}

	if t == nil {
		return nil
	}

	return t.(ISearch_exprContext)
}

func (s *Or_search_exprContext) Or_op() IOr_opContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(IOr_opContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(IOr_opContext)
}

func (s *Or_search_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterOr_search_expr(s)
	}
}

func (s *Or_search_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitOr_search_expr(s)
	}
}

type Implicit_and_search_exprContext struct {
	Search_exprContext
}

func NewImplicit_and_search_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Implicit_and_search_exprContext {
	var p = new(Implicit_and_search_exprContext)

	InitEmptySearch_exprContext(&p.Search_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Search_exprContext))

	return p
}

func (s *Implicit_and_search_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Implicit_and_search_exprContext) AllSearch_expr() []ISearch_exprContext {
	children := s.GetChildren()
	len := 0
	for _, ctx := range children {
		if _, ok := ctx.(ISearch_exprContext); ok {
			len++
		}
	}

	tst := make([]ISearch_exprContext, len)
	i := 0
	for _, ctx := range children {
		if t, ok := ctx.(ISearch_exprContext); ok {
			tst[i] = t.(ISearch_exprContext)
			i++
		}
	}

	return tst
}

func (s *Implicit_and_search_exprContext) Search_expr(i int) ISearch_exprContext {
	var t antlr.RuleContext
	j := 0
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ISearch_exprContext); ok {
			if j == i {
				t = ctx.(antlr.RuleContext)
				break
			}
			j++
		}
	}

	if t == nil {
		return nil
	}

	return t.(ISearch_exprContext)
}

func (s *Implicit_and_search_exprContext) Implicit_and_op() IImplicit_and_opContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(IImplicit_and_opContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(IImplicit_and_opContext)
}

func (s *Implicit_and_search_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterImplicit_and_search_expr(s)
	}
}

func (s *Implicit_and_search_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitImplicit_and_search_expr(s)
	}
}

type Exists_search_exprContext struct {
	Search_exprContext
}

func NewExists_search_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Exists_search_exprContext {
	var p = new(Exists_search_exprContext)

	InitEmptySearch_exprContext(&p.Search_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Search_exprContext))

	return p
}

func (s *Exists_search_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Exists_search_exprContext) Search_key() ISearch_keyContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ISearch_keyContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ISearch_keyContext)
}

func (s *Exists_search_exprContext) Exists_op() IExists_opContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(IExists_opContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(IExists_opContext)
}

func (s *Exists_search_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterExists_search_expr(s)
	}
}

func (s *Exists_search_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitExists_search_expr(s)
	}
}

type Key_val_search_exprContext struct {
	Search_exprContext
}

func NewKey_val_search_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Key_val_search_exprContext {
	var p = new(Key_val_search_exprContext)

	InitEmptySearch_exprContext(&p.Search_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Search_exprContext))

	return p
}

func (s *Key_val_search_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Key_val_search_exprContext) Search_key() ISearch_keyContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ISearch_keyContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ISearch_keyContext)
}

func (s *Key_val_search_exprContext) Bin_op() IBin_opContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(IBin_opContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(IBin_opContext)
}

func (s *Key_val_search_exprContext) Top_col_expr() ITop_col_exprContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ITop_col_exprContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ITop_col_exprContext)
}

func (s *Key_val_search_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterKey_val_search_expr(s)
	}
}

func (s *Key_val_search_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitKey_val_search_expr(s)
	}
}

type Paren_search_exprContext struct {
	Search_exprContext
}

func NewParen_search_exprContext(parser antlr.Parser, ctx antlr.ParserRuleContext) *Paren_search_exprContext {
	var p = new(Paren_search_exprContext)

	InitEmptySearch_exprContext(&p.Search_exprContext)
	p.parser = parser
	p.CopyAll(ctx.(*Search_exprContext))

	return p
}

func (s *Paren_search_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Paren_search_exprContext) LPAREN() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserLPAREN, 0)
}

func (s *Paren_search_exprContext) Search_expr() ISearch_exprContext {
	var t antlr.RuleContext
	for _, ctx := range s.GetChildren() {
		if _, ok := ctx.(ISearch_exprContext); ok {
			t = ctx.(antlr.RuleContext)
			break
		}
	}

	if t == nil {
		return nil
	}

	return t.(ISearch_exprContext)
}

func (s *Paren_search_exprContext) RPAREN() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserRPAREN, 0)
}

func (s *Paren_search_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterParen_search_expr(s)
	}
}

func (s *Paren_search_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitParen_search_expr(s)
	}
}

func (p *SearchGrammarParser) Search_expr() (localctx ISearch_exprContext) {
	return p.search_expr(0)
}

func (p *SearchGrammarParser) search_expr(_p int) (localctx ISearch_exprContext) {
	var _parentctx antlr.ParserRuleContext = p.GetParserRuleContext()

	_parentState := p.GetState()
	localctx = NewSearch_exprContext(p, p.GetParserRuleContext(), _parentState)
	var _prevctx ISearch_exprContext = localctx
	var _ antlr.ParserRuleContext = _prevctx // TODO: To prevent unused variable warning.
	_startState := 6
	p.EnterRecursionRule(localctx, 6, SearchGrammarParserRULE_search_expr, _p)
	var _alt int

	p.EnterOuterAlt(localctx, 1)
	p.SetState(78)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}

	switch p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 5, p.GetParserRuleContext()) {
	case 1:
		localctx = NewParen_search_exprContext(p, localctx)
		p.SetParserRuleContext(localctx)
		_prevctx = localctx

		{
			p.SetState(63)
			p.Match(SearchGrammarParserLPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}
		{
			p.SetState(64)
			p.search_expr(0)
		}
		{
			p.SetState(65)
			p.Match(SearchGrammarParserRPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	case 2:
		localctx = NewNegated_search_exprContext(p, localctx)
		p.SetParserRuleContext(localctx)
		_prevctx = localctx
		{
			p.SetState(67)
			p.Negation_op()
		}
		{
			p.SetState(68)
			p.search_expr(7)
		}

	case 3:
		localctx = NewKey_val_search_exprContext(p, localctx)
		p.SetParserRuleContext(localctx)
		_prevctx = localctx
		{
			p.SetState(70)
			p.Search_key()
		}
		{
			p.SetState(71)
			p.Bin_op()
		}
		{
			p.SetState(72)
			p.Top_col_expr()
		}

	case 4:
		localctx = NewExists_search_exprContext(p, localctx)
		p.SetParserRuleContext(localctx)
		_prevctx = localctx
		{
			p.SetState(74)
			p.Search_key()
		}
		{
			p.SetState(75)
			p.Exists_op()
		}

	case 5:
		localctx = NewBody_search_exprContext(p, localctx)
		p.SetParserRuleContext(localctx)
		_prevctx = localctx
		{
			p.SetState(77)
			p.Top_col_expr()
		}

	case antlr.ATNInvalidAltNumber:
		goto errorExit
	}
	p.GetParserRuleContext().SetStop(p.GetTokenStream().LT(-1))
	p.SetState(94)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}
	_alt = p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 7, p.GetParserRuleContext())
	if p.HasError() {
		goto errorExit
	}
	for _alt != 2 && _alt != antlr.ATNInvalidAltNumber {
		if _alt == 1 {
			if p.GetParseListeners() != nil {
				p.TriggerExitRuleEvent()
			}
			_prevctx = localctx
			p.SetState(92)
			p.GetErrorHandler().Sync(p)
			if p.HasError() {
				goto errorExit
			}

			switch p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 6, p.GetParserRuleContext()) {
			case 1:
				localctx = NewAnd_search_exprContext(p, NewSearch_exprContext(p, _parentctx, _parentState))
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_search_expr)
				p.SetState(80)

				if !(p.Precpred(p.GetParserRuleContext(), 6)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 6)", ""))
					goto errorExit
				}
				{
					p.SetState(81)
					p.And_op()
				}
				{
					p.SetState(82)
					p.search_expr(7)
				}

			case 2:
				localctx = NewOr_search_exprContext(p, NewSearch_exprContext(p, _parentctx, _parentState))
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_search_expr)
				p.SetState(84)

				if !(p.Precpred(p.GetParserRuleContext(), 5)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 5)", ""))
					goto errorExit
				}
				{
					p.SetState(85)
					p.Or_op()
				}
				{
					p.SetState(86)
					p.search_expr(6)
				}

			case 3:
				localctx = NewImplicit_and_search_exprContext(p, NewSearch_exprContext(p, _parentctx, _parentState))
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_search_expr)
				p.SetState(88)

				if !(p.Precpred(p.GetParserRuleContext(), 4)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 4)", ""))
					goto errorExit
				}
				{
					p.SetState(89)
					p.Implicit_and_op()
				}
				{
					p.SetState(90)
					p.search_expr(5)
				}

			case antlr.ATNInvalidAltNumber:
				goto errorExit
			}

		}
		p.SetState(96)
		p.GetErrorHandler().Sync(p)
		if p.HasError() {
			goto errorExit
		}
		_alt = p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 7, p.GetParserRuleContext())
		if p.HasError() {
			goto errorExit
		}
	}

errorExit:
	if p.HasError() {
		v := p.GetError()
		localctx.SetException(v)
		p.GetErrorHandler().ReportError(p, v)
		p.GetErrorHandler().Recover(p, v)
		p.SetError(nil)
	}
	p.UnrollRecursionContexts(_parentctx)
	return localctx
	goto errorExit // Trick to prevent compiler error if the label is not used
}

// ISearch_keyContext is an interface to support dynamic dispatch.
type ISearch_keyContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser

	// Getter signatures
	ID() antlr.TerminalNode

	// IsSearch_keyContext differentiates from other interfaces.
	IsSearch_keyContext()
}

type Search_keyContext struct {
	antlr.BaseParserRuleContext
	parser antlr.Parser
}

func NewEmptySearch_keyContext() *Search_keyContext {
	var p = new(Search_keyContext)
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_search_key
	return p
}

func InitEmptySearch_keyContext(p *Search_keyContext) {
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_search_key
}

func (*Search_keyContext) IsSearch_keyContext() {}

func NewSearch_keyContext(parser antlr.Parser, parent antlr.ParserRuleContext, invokingState int) *Search_keyContext {
	var p = new(Search_keyContext)

	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, parent, invokingState)

	p.parser = parser
	p.RuleIndex = SearchGrammarParserRULE_search_key

	return p
}

func (s *Search_keyContext) GetParser() antlr.Parser { return s.parser }

func (s *Search_keyContext) ID() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserID, 0)
}

func (s *Search_keyContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Search_keyContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

func (s *Search_keyContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterSearch_key(s)
	}
}

func (s *Search_keyContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitSearch_key(s)
	}
}

func (p *SearchGrammarParser) Search_key() (localctx ISearch_keyContext) {
	localctx = NewSearch_keyContext(p, p.GetParserRuleContext(), p.GetState())
	p.EnterRule(localctx, 8, SearchGrammarParserRULE_search_key)
	p.EnterOuterAlt(localctx, 1)
	{
		p.SetState(97)
		p.Match(SearchGrammarParserID)
		if p.HasError() {
			// Recognition error - abort rule
			goto errorExit
		}
	}

errorExit:
	if p.HasError() {
		v := p.GetError()
		localctx.SetException(v)
		p.GetErrorHandler().ReportError(p, v)
		p.GetErrorHandler().Recover(p, v)
		p.SetError(nil)
	}
	p.ExitRule()
	return localctx
	goto errorExit // Trick to prevent compiler error if the label is not used
}

// IAnd_opContext is an interface to support dynamic dispatch.
type IAnd_opContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser

	// Getter signatures
	AND() antlr.TerminalNode

	// IsAnd_opContext differentiates from other interfaces.
	IsAnd_opContext()
}

type And_opContext struct {
	antlr.BaseParserRuleContext
	parser antlr.Parser
}

func NewEmptyAnd_opContext() *And_opContext {
	var p = new(And_opContext)
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_and_op
	return p
}

func InitEmptyAnd_opContext(p *And_opContext) {
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_and_op
}

func (*And_opContext) IsAnd_opContext() {}

func NewAnd_opContext(parser antlr.Parser, parent antlr.ParserRuleContext, invokingState int) *And_opContext {
	var p = new(And_opContext)

	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, parent, invokingState)

	p.parser = parser
	p.RuleIndex = SearchGrammarParserRULE_and_op

	return p
}

func (s *And_opContext) GetParser() antlr.Parser { return s.parser }

func (s *And_opContext) AND() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserAND, 0)
}

func (s *And_opContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *And_opContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

func (s *And_opContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterAnd_op(s)
	}
}

func (s *And_opContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitAnd_op(s)
	}
}

func (p *SearchGrammarParser) And_op() (localctx IAnd_opContext) {
	localctx = NewAnd_opContext(p, p.GetParserRuleContext(), p.GetState())
	p.EnterRule(localctx, 10, SearchGrammarParserRULE_and_op)
	p.EnterOuterAlt(localctx, 1)
	{
		p.SetState(99)
		p.Match(SearchGrammarParserAND)
		if p.HasError() {
			// Recognition error - abort rule
			goto errorExit
		}
	}

errorExit:
	if p.HasError() {
		v := p.GetError()
		localctx.SetException(v)
		p.GetErrorHandler().ReportError(p, v)
		p.GetErrorHandler().Recover(p, v)
		p.SetError(nil)
	}
	p.ExitRule()
	return localctx
	goto errorExit // Trick to prevent compiler error if the label is not used
}

// IImplicit_and_opContext is an interface to support dynamic dispatch.
type IImplicit_and_opContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser
	// IsImplicit_and_opContext differentiates from other interfaces.
	IsImplicit_and_opContext()
}

type Implicit_and_opContext struct {
	antlr.BaseParserRuleContext
	parser antlr.Parser
}

func NewEmptyImplicit_and_opContext() *Implicit_and_opContext {
	var p = new(Implicit_and_opContext)
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_implicit_and_op
	return p
}

func InitEmptyImplicit_and_opContext(p *Implicit_and_opContext) {
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_implicit_and_op
}

func (*Implicit_and_opContext) IsImplicit_and_opContext() {}

func NewImplicit_and_opContext(parser antlr.Parser, parent antlr.ParserRuleContext, invokingState int) *Implicit_and_opContext {
	var p = new(Implicit_and_opContext)

	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, parent, invokingState)

	p.parser = parser
	p.RuleIndex = SearchGrammarParserRULE_implicit_and_op

	return p
}

func (s *Implicit_and_opContext) GetParser() antlr.Parser { return s.parser }
func (s *Implicit_and_opContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Implicit_and_opContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

func (s *Implicit_and_opContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterImplicit_and_op(s)
	}
}

func (s *Implicit_and_opContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitImplicit_and_op(s)
	}
}

func (p *SearchGrammarParser) Implicit_and_op() (localctx IImplicit_and_opContext) {
	localctx = NewImplicit_and_opContext(p, p.GetParserRuleContext(), p.GetState())
	p.EnterRule(localctx, 12, SearchGrammarParserRULE_implicit_and_op)
	p.EnterOuterAlt(localctx, 1)

errorExit:
	if p.HasError() {
		v := p.GetError()
		localctx.SetException(v)
		p.GetErrorHandler().ReportError(p, v)
		p.GetErrorHandler().Recover(p, v)
		p.SetError(nil)
	}
	p.ExitRule()
	return localctx
	goto errorExit // Trick to prevent compiler error if the label is not used
}

// IOr_opContext is an interface to support dynamic dispatch.
type IOr_opContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser

	// Getter signatures
	OR() antlr.TerminalNode

	// IsOr_opContext differentiates from other interfaces.
	IsOr_opContext()
}

type Or_opContext struct {
	antlr.BaseParserRuleContext
	parser antlr.Parser
}

func NewEmptyOr_opContext() *Or_opContext {
	var p = new(Or_opContext)
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_or_op
	return p
}

func InitEmptyOr_opContext(p *Or_opContext) {
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_or_op
}

func (*Or_opContext) IsOr_opContext() {}

func NewOr_opContext(parser antlr.Parser, parent antlr.ParserRuleContext, invokingState int) *Or_opContext {
	var p = new(Or_opContext)

	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, parent, invokingState)

	p.parser = parser
	p.RuleIndex = SearchGrammarParserRULE_or_op

	return p
}

func (s *Or_opContext) GetParser() antlr.Parser { return s.parser }

func (s *Or_opContext) OR() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserOR, 0)
}

func (s *Or_opContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Or_opContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

func (s *Or_opContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterOr_op(s)
	}
}

func (s *Or_opContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitOr_op(s)
	}
}

func (p *SearchGrammarParser) Or_op() (localctx IOr_opContext) {
	localctx = NewOr_opContext(p, p.GetParserRuleContext(), p.GetState())
	p.EnterRule(localctx, 14, SearchGrammarParserRULE_or_op)
	p.EnterOuterAlt(localctx, 1)
	{
		p.SetState(103)
		p.Match(SearchGrammarParserOR)
		if p.HasError() {
			// Recognition error - abort rule
			goto errorExit
		}
	}

errorExit:
	if p.HasError() {
		v := p.GetError()
		localctx.SetException(v)
		p.GetErrorHandler().ReportError(p, v)
		p.GetErrorHandler().Recover(p, v)
		p.SetError(nil)
	}
	p.ExitRule()
	return localctx
	goto errorExit // Trick to prevent compiler error if the label is not used
}

// IExists_opContext is an interface to support dynamic dispatch.
type IExists_opContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser

	// Getter signatures
	EXISTS() antlr.TerminalNode
	NOT() antlr.TerminalNode

	// IsExists_opContext differentiates from other interfaces.
	IsExists_opContext()
}

type Exists_opContext struct {
	antlr.BaseParserRuleContext
	parser antlr.Parser
}

func NewEmptyExists_opContext() *Exists_opContext {
	var p = new(Exists_opContext)
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_exists_op
	return p
}

func InitEmptyExists_opContext(p *Exists_opContext) {
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_exists_op
}

func (*Exists_opContext) IsExists_opContext() {}

func NewExists_opContext(parser antlr.Parser, parent antlr.ParserRuleContext, invokingState int) *Exists_opContext {
	var p = new(Exists_opContext)

	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, parent, invokingState)

	p.parser = parser
	p.RuleIndex = SearchGrammarParserRULE_exists_op

	return p
}

func (s *Exists_opContext) GetParser() antlr.Parser { return s.parser }

func (s *Exists_opContext) EXISTS() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserEXISTS, 0)
}

func (s *Exists_opContext) NOT() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserNOT, 0)
}

func (s *Exists_opContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Exists_opContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

func (s *Exists_opContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterExists_op(s)
	}
}

func (s *Exists_opContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitExists_op(s)
	}
}

func (p *SearchGrammarParser) Exists_op() (localctx IExists_opContext) {
	localctx = NewExists_opContext(p, p.GetParserRuleContext(), p.GetState())
	p.EnterRule(localctx, 16, SearchGrammarParserRULE_exists_op)
	p.SetState(108)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}

	switch p.GetTokenStream().LA(1) {
	case SearchGrammarParserEXISTS:
		p.EnterOuterAlt(localctx, 1)
		{
			p.SetState(105)
			p.Match(SearchGrammarParserEXISTS)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	case SearchGrammarParserNOT:
		p.EnterOuterAlt(localctx, 2)
		{
			p.SetState(106)
			p.Match(SearchGrammarParserNOT)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}
		{
			p.SetState(107)
			p.Match(SearchGrammarParserEXISTS)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	default:
		p.SetError(antlr.NewNoViableAltException(p, nil, nil, nil, nil, nil))
		goto errorExit
	}

errorExit:
	if p.HasError() {
		v := p.GetError()
		localctx.SetException(v)
		p.GetErrorHandler().ReportError(p, v)
		p.GetErrorHandler().Recover(p, v)
		p.SetError(nil)
	}
	p.ExitRule()
	return localctx
	goto errorExit // Trick to prevent compiler error if the label is not used
}

// INegation_opContext is an interface to support dynamic dispatch.
type INegation_opContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser

	// Getter signatures
	NOT() antlr.TerminalNode

	// IsNegation_opContext differentiates from other interfaces.
	IsNegation_opContext()
}

type Negation_opContext struct {
	antlr.BaseParserRuleContext
	parser antlr.Parser
}

func NewEmptyNegation_opContext() *Negation_opContext {
	var p = new(Negation_opContext)
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_negation_op
	return p
}

func InitEmptyNegation_opContext(p *Negation_opContext) {
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_negation_op
}

func (*Negation_opContext) IsNegation_opContext() {}

func NewNegation_opContext(parser antlr.Parser, parent antlr.ParserRuleContext, invokingState int) *Negation_opContext {
	var p = new(Negation_opContext)

	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, parent, invokingState)

	p.parser = parser
	p.RuleIndex = SearchGrammarParserRULE_negation_op

	return p
}

func (s *Negation_opContext) GetParser() antlr.Parser { return s.parser }

func (s *Negation_opContext) NOT() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserNOT, 0)
}

func (s *Negation_opContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Negation_opContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

func (s *Negation_opContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterNegation_op(s)
	}
}

func (s *Negation_opContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitNegation_op(s)
	}
}

func (p *SearchGrammarParser) Negation_op() (localctx INegation_opContext) {
	localctx = NewNegation_opContext(p, p.GetParserRuleContext(), p.GetState())
	p.EnterRule(localctx, 18, SearchGrammarParserRULE_negation_op)
	p.EnterOuterAlt(localctx, 1)
	{
		p.SetState(110)
		p.Match(SearchGrammarParserNOT)
		if p.HasError() {
			// Recognition error - abort rule
			goto errorExit
		}
	}

errorExit:
	if p.HasError() {
		v := p.GetError()
		localctx.SetException(v)
		p.GetErrorHandler().ReportError(p, v)
		p.GetErrorHandler().Recover(p, v)
		p.SetError(nil)
	}
	p.ExitRule()
	return localctx
	goto errorExit // Trick to prevent compiler error if the label is not used
}

// IBin_opContext is an interface to support dynamic dispatch.
type IBin_opContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser

	// Getter signatures
	BANG() antlr.TerminalNode
	EQ() antlr.TerminalNode
	NEQ() antlr.TerminalNode
	GT() antlr.TerminalNode
	GTE() antlr.TerminalNode
	LT() antlr.TerminalNode
	LTE() antlr.TerminalNode
	COLON() antlr.TerminalNode

	// IsBin_opContext differentiates from other interfaces.
	IsBin_opContext()
}

type Bin_opContext struct {
	antlr.BaseParserRuleContext
	parser antlr.Parser
}

func NewEmptyBin_opContext() *Bin_opContext {
	var p = new(Bin_opContext)
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_bin_op
	return p
}

func InitEmptyBin_opContext(p *Bin_opContext) {
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_bin_op
}

func (*Bin_opContext) IsBin_opContext() {}

func NewBin_opContext(parser antlr.Parser, parent antlr.ParserRuleContext, invokingState int) *Bin_opContext {
	var p = new(Bin_opContext)

	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, parent, invokingState)

	p.parser = parser
	p.RuleIndex = SearchGrammarParserRULE_bin_op

	return p
}

func (s *Bin_opContext) GetParser() antlr.Parser { return s.parser }

func (s *Bin_opContext) BANG() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserBANG, 0)
}

func (s *Bin_opContext) EQ() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserEQ, 0)
}

func (s *Bin_opContext) NEQ() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserNEQ, 0)
}

func (s *Bin_opContext) GT() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserGT, 0)
}

func (s *Bin_opContext) GTE() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserGTE, 0)
}

func (s *Bin_opContext) LT() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserLT, 0)
}

func (s *Bin_opContext) LTE() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserLTE, 0)
}

func (s *Bin_opContext) COLON() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserCOLON, 0)
}

func (s *Bin_opContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Bin_opContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

func (s *Bin_opContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterBin_op(s)
	}
}

func (s *Bin_opContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitBin_op(s)
	}
}

func (p *SearchGrammarParser) Bin_op() (localctx IBin_opContext) {
	localctx = NewBin_opContext(p, p.GetParserRuleContext(), p.GetState())
	p.EnterRule(localctx, 20, SearchGrammarParserRULE_bin_op)
	var _la int

	p.EnterOuterAlt(localctx, 1)
	{
		p.SetState(112)
		_la = p.GetTokenStream().LA(1)

		if !((int64(_la) & ^0x3f) == 0 && ((int64(1)<<_la)&20448) != 0) {
			p.GetErrorHandler().RecoverInline(p)
		} else {
			p.GetErrorHandler().ReportMatch(p)
			p.Consume()
		}
	}

errorExit:
	if p.HasError() {
		v := p.GetError()
		localctx.SetException(v)
		p.GetErrorHandler().ReportError(p, v)
		p.GetErrorHandler().Recover(p, v)
		p.SetError(nil)
	}
	p.ExitRule()
	return localctx
	goto errorExit // Trick to prevent compiler error if the label is not used
}

// ISearch_valueContext is an interface to support dynamic dispatch.
type ISearch_valueContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser

	// Getter signatures
	STRING() antlr.TerminalNode
	ID() antlr.TerminalNode
	VALUE() antlr.TerminalNode

	// IsSearch_valueContext differentiates from other interfaces.
	IsSearch_valueContext()
}

type Search_valueContext struct {
	antlr.BaseParserRuleContext
	parser antlr.Parser
}

func NewEmptySearch_valueContext() *Search_valueContext {
	var p = new(Search_valueContext)
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_search_value
	return p
}

func InitEmptySearch_valueContext(p *Search_valueContext) {
	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, nil, -1)
	p.RuleIndex = SearchGrammarParserRULE_search_value
}

func (*Search_valueContext) IsSearch_valueContext() {}

func NewSearch_valueContext(parser antlr.Parser, parent antlr.ParserRuleContext, invokingState int) *Search_valueContext {
	var p = new(Search_valueContext)

	antlr.InitBaseParserRuleContext(&p.BaseParserRuleContext, parent, invokingState)

	p.parser = parser
	p.RuleIndex = SearchGrammarParserRULE_search_value

	return p
}

func (s *Search_valueContext) GetParser() antlr.Parser { return s.parser }

func (s *Search_valueContext) STRING() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserSTRING, 0)
}

func (s *Search_valueContext) ID() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserID, 0)
}

func (s *Search_valueContext) VALUE() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserVALUE, 0)
}

func (s *Search_valueContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Search_valueContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

func (s *Search_valueContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterSearch_value(s)
	}
}

func (s *Search_valueContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitSearch_value(s)
	}
}

func (p *SearchGrammarParser) Search_value() (localctx ISearch_valueContext) {
	localctx = NewSearch_valueContext(p, p.GetParserRuleContext(), p.GetState())
	p.EnterRule(localctx, 22, SearchGrammarParserRULE_search_value)
	var _la int

	p.EnterOuterAlt(localctx, 1)
	{
		p.SetState(114)
		_la = p.GetTokenStream().LA(1)

		if !((int64(_la) & ^0x3f) == 0 && ((int64(1)<<_la)&229376) != 0) {
			p.GetErrorHandler().RecoverInline(p)
		} else {
			p.GetErrorHandler().ReportMatch(p)
			p.Consume()
		}
	}

errorExit:
	if p.HasError() {
		v := p.GetError()
		localctx.SetException(v)
		p.GetErrorHandler().ReportError(p, v)
		p.GetErrorHandler().Recover(p, v)
		p.SetError(nil)
	}
	p.ExitRule()
	return localctx
	goto errorExit // Trick to prevent compiler error if the label is not used
}

func (p *SearchGrammarParser) Sempred(localctx antlr.RuleContext, ruleIndex, predIndex int) bool {
	switch ruleIndex {
	case 2:
		var t *Col_exprContext = nil
		if localctx != nil {
			t = localctx.(*Col_exprContext)
		}
		return p.Col_expr_Sempred(t, predIndex)

	case 3:
		var t *Search_exprContext = nil
		if localctx != nil {
			t = localctx.(*Search_exprContext)
		}
		return p.Search_expr_Sempred(t, predIndex)

	default:
		panic("No predicate with index: " + fmt.Sprint(ruleIndex))
	}
}

func (p *SearchGrammarParser) Col_expr_Sempred(localctx antlr.RuleContext, predIndex int) bool {
	switch predIndex {
	case 0:
		return p.Precpred(p.GetParserRuleContext(), 3)

	case 1:
		return p.Precpred(p.GetParserRuleContext(), 2)

	default:
		panic("No predicate with index: " + fmt.Sprint(predIndex))
	}
}

func (p *SearchGrammarParser) Search_expr_Sempred(localctx antlr.RuleContext, predIndex int) bool {
	switch predIndex {
	case 2:
		return p.Precpred(p.GetParserRuleContext(), 6)

	case 3:
		return p.Precpred(p.GetParserRuleContext(), 5)

	case 4:
		return p.Precpred(p.GetParserRuleContext(), 4)

	default:
		panic("No predicate with index: " + fmt.Sprint(predIndex))
	}
}
