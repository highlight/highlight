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
		"", "'AND'", "'OR'", "'NOT'", "'='", "'!='", "'<'", "'<='", "'>'", "'>='",
		"'('", "')'", "':'",
	}
	staticData.SymbolicNames = []string{
		"", "AND", "OR", "NOT", "EQ", "NEQ", "LT", "LTE", "GT", "GTE", "LPAREN",
		"RPAREN", "COLON", "ID", "STRING", "VALUE", "WS",
	}
	staticData.RuleNames = []string{
		"search_query", "top_col_expr", "col_expr", "search_expr", "search_key",
		"and_op", "or_op", "negation_op", "bin_op", "search_value",
	}
	staticData.PredictionContextCache = antlr.NewPredictionContextCache()
	staticData.serializedATN = []int32{
		4, 1, 16, 101, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7,
		4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 1, 0, 1,
		0, 1, 0, 1, 0, 3, 0, 25, 8, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 3, 1, 35, 8, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1,
		2, 3, 2, 46, 8, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 55,
		8, 2, 10, 2, 12, 2, 58, 9, 2, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3,
		1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 3, 3, 73, 8, 3, 1, 3, 1, 3, 1, 3, 1,
		3, 1, 3, 1, 3, 1, 3, 5, 3, 82, 8, 3, 10, 3, 12, 3, 85, 9, 3, 1, 4, 1, 4,
		1, 5, 1, 5, 3, 5, 91, 8, 5, 1, 6, 1, 6, 1, 7, 1, 7, 1, 8, 1, 8, 1, 9, 1,
		9, 1, 9, 0, 2, 4, 6, 10, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 0, 2, 2, 0,
		4, 9, 12, 12, 2, 0, 13, 13, 15, 15, 103, 0, 24, 1, 0, 0, 0, 2, 34, 1, 0,
		0, 0, 4, 45, 1, 0, 0, 0, 6, 72, 1, 0, 0, 0, 8, 86, 1, 0, 0, 0, 10, 90,
		1, 0, 0, 0, 12, 92, 1, 0, 0, 0, 14, 94, 1, 0, 0, 0, 16, 96, 1, 0, 0, 0,
		18, 98, 1, 0, 0, 0, 20, 25, 5, 0, 0, 1, 21, 22, 3, 6, 3, 0, 22, 23, 5,
		0, 0, 1, 23, 25, 1, 0, 0, 0, 24, 20, 1, 0, 0, 0, 24, 21, 1, 0, 0, 0, 25,
		1, 1, 0, 0, 0, 26, 27, 5, 10, 0, 0, 27, 28, 3, 4, 2, 0, 28, 29, 5, 11,
		0, 0, 29, 35, 1, 0, 0, 0, 30, 31, 3, 14, 7, 0, 31, 32, 3, 2, 1, 0, 32,
		35, 1, 0, 0, 0, 33, 35, 3, 18, 9, 0, 34, 26, 1, 0, 0, 0, 34, 30, 1, 0,
		0, 0, 34, 33, 1, 0, 0, 0, 35, 3, 1, 0, 0, 0, 36, 37, 6, 2, -1, 0, 37, 38,
		5, 10, 0, 0, 38, 39, 3, 4, 2, 0, 39, 40, 5, 11, 0, 0, 40, 46, 1, 0, 0,
		0, 41, 42, 3, 14, 7, 0, 42, 43, 3, 4, 2, 4, 43, 46, 1, 0, 0, 0, 44, 46,
		3, 18, 9, 0, 45, 36, 1, 0, 0, 0, 45, 41, 1, 0, 0, 0, 45, 44, 1, 0, 0, 0,
		46, 56, 1, 0, 0, 0, 47, 48, 10, 3, 0, 0, 48, 49, 3, 10, 5, 0, 49, 50, 3,
		4, 2, 4, 50, 55, 1, 0, 0, 0, 51, 52, 10, 2, 0, 0, 52, 53, 5, 2, 0, 0, 53,
		55, 3, 4, 2, 3, 54, 47, 1, 0, 0, 0, 54, 51, 1, 0, 0, 0, 55, 58, 1, 0, 0,
		0, 56, 54, 1, 0, 0, 0, 56, 57, 1, 0, 0, 0, 57, 5, 1, 0, 0, 0, 58, 56, 1,
		0, 0, 0, 59, 60, 6, 3, -1, 0, 60, 61, 5, 10, 0, 0, 61, 62, 3, 6, 3, 0,
		62, 63, 5, 11, 0, 0, 63, 73, 1, 0, 0, 0, 64, 65, 3, 14, 7, 0, 65, 66, 3,
		6, 3, 5, 66, 73, 1, 0, 0, 0, 67, 68, 3, 8, 4, 0, 68, 69, 3, 16, 8, 0, 69,
		70, 3, 2, 1, 0, 70, 73, 1, 0, 0, 0, 71, 73, 3, 2, 1, 0, 72, 59, 1, 0, 0,
		0, 72, 64, 1, 0, 0, 0, 72, 67, 1, 0, 0, 0, 72, 71, 1, 0, 0, 0, 73, 83,
		1, 0, 0, 0, 74, 75, 10, 4, 0, 0, 75, 76, 3, 10, 5, 0, 76, 77, 3, 6, 3,
		5, 77, 82, 1, 0, 0, 0, 78, 79, 10, 3, 0, 0, 79, 80, 5, 2, 0, 0, 80, 82,
		3, 6, 3, 4, 81, 74, 1, 0, 0, 0, 81, 78, 1, 0, 0, 0, 82, 85, 1, 0, 0, 0,
		83, 81, 1, 0, 0, 0, 83, 84, 1, 0, 0, 0, 84, 7, 1, 0, 0, 0, 85, 83, 1, 0,
		0, 0, 86, 87, 5, 13, 0, 0, 87, 9, 1, 0, 0, 0, 88, 91, 5, 1, 0, 0, 89, 91,
		1, 0, 0, 0, 90, 88, 1, 0, 0, 0, 90, 89, 1, 0, 0, 0, 91, 11, 1, 0, 0, 0,
		92, 93, 5, 2, 0, 0, 93, 13, 1, 0, 0, 0, 94, 95, 5, 3, 0, 0, 95, 15, 1,
		0, 0, 0, 96, 97, 7, 0, 0, 0, 97, 17, 1, 0, 0, 0, 98, 99, 7, 1, 0, 0, 99,
		19, 1, 0, 0, 0, 9, 24, 34, 45, 54, 56, 72, 81, 83, 90,
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
	SearchGrammarParserEOF    = antlr.TokenEOF
	SearchGrammarParserAND    = 1
	SearchGrammarParserOR     = 2
	SearchGrammarParserNOT    = 3
	SearchGrammarParserEQ     = 4
	SearchGrammarParserNEQ    = 5
	SearchGrammarParserLT     = 6
	SearchGrammarParserLTE    = 7
	SearchGrammarParserGT     = 8
	SearchGrammarParserGTE    = 9
	SearchGrammarParserLPAREN = 10
	SearchGrammarParserRPAREN = 11
	SearchGrammarParserCOLON  = 12
	SearchGrammarParserID     = 13
	SearchGrammarParserSTRING = 14
	SearchGrammarParserVALUE  = 15
	SearchGrammarParserWS     = 16
)

// SearchGrammarParser rules.
const (
	SearchGrammarParserRULE_search_query = 0
	SearchGrammarParserRULE_top_col_expr = 1
	SearchGrammarParserRULE_col_expr     = 2
	SearchGrammarParserRULE_search_expr  = 3
	SearchGrammarParserRULE_search_key   = 4
	SearchGrammarParserRULE_and_op       = 5
	SearchGrammarParserRULE_or_op        = 6
	SearchGrammarParserRULE_negation_op  = 7
	SearchGrammarParserRULE_bin_op       = 8
	SearchGrammarParserRULE_search_value = 9
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
	p.SetState(24)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}

	switch p.GetTokenStream().LA(1) {
	case SearchGrammarParserEOF:
		p.EnterOuterAlt(localctx, 1)
		{
			p.SetState(20)
			p.Match(SearchGrammarParserEOF)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	case SearchGrammarParserNOT, SearchGrammarParserLPAREN, SearchGrammarParserID, SearchGrammarParserVALUE:
		p.EnterOuterAlt(localctx, 2)
		{
			p.SetState(21)
			p.search_expr(0)
		}
		{
			p.SetState(22)
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
	p.SetState(34)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}

	switch p.GetTokenStream().LA(1) {
	case SearchGrammarParserLPAREN:
		localctx = NewTop_paren_col_exprContext(p, localctx)
		p.EnterOuterAlt(localctx, 1)
		{
			p.SetState(26)
			p.Match(SearchGrammarParserLPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}
		{
			p.SetState(27)
			p.col_expr(0)
		}
		{
			p.SetState(28)
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
			p.SetState(30)
			p.Negation_op()
		}
		{
			p.SetState(31)
			p.Top_col_expr()
		}

	case SearchGrammarParserID, SearchGrammarParserVALUE:
		localctx = NewTop_col_search_valueContext(p, localctx)
		p.EnterOuterAlt(localctx, 3)
		{
			p.SetState(33)
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

func (s *And_col_exprContext) And_op() IAnd_opContext {
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
	p.SetState(45)
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
			p.SetState(37)
			p.Match(SearchGrammarParserLPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}
		{
			p.SetState(38)
			p.col_expr(0)
		}
		{
			p.SetState(39)
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
			p.SetState(41)
			p.Negation_op()
		}
		{
			p.SetState(42)
			p.col_expr(4)
		}

	case SearchGrammarParserID, SearchGrammarParserVALUE:
		localctx = NewCol_search_valueContext(p, localctx)
		p.SetParserRuleContext(localctx)
		_prevctx = localctx
		{
			p.SetState(44)
			p.Search_value()
		}

	default:
		p.SetError(antlr.NewNoViableAltException(p, nil, nil, nil, nil, nil))
		goto errorExit
	}
	p.GetParserRuleContext().SetStop(p.GetTokenStream().LT(-1))
	p.SetState(56)
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
			p.SetState(54)
			p.GetErrorHandler().Sync(p)
			if p.HasError() {
				goto errorExit
			}

			switch p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 3, p.GetParserRuleContext()) {
			case 1:
				localctx = NewAnd_col_exprContext(p, NewCol_exprContext(p, _parentctx, _parentState))
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_col_expr)
				p.SetState(47)

				if !(p.Precpred(p.GetParserRuleContext(), 3)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 3)", ""))
					goto errorExit
				}
				{
					p.SetState(48)
					p.And_op()
				}
				{
					p.SetState(49)
					p.col_expr(4)
				}

			case 2:
				localctx = NewOr_col_exprContext(p, NewCol_exprContext(p, _parentctx, _parentState))
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_col_expr)
				p.SetState(51)

				if !(p.Precpred(p.GetParserRuleContext(), 2)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 2)", ""))
					goto errorExit
				}
				{
					p.SetState(52)
					p.Match(SearchGrammarParserOR)
					if p.HasError() {
						// Recognition error - abort rule
						goto errorExit
					}
				}
				{
					p.SetState(53)
					p.col_expr(3)
				}

			case antlr.ATNInvalidAltNumber:
				goto errorExit
			}

		}
		p.SetState(58)
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

func (s *Or_search_exprContext) OR() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserOR, 0)
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
	p.SetState(72)
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
			p.SetState(60)
			p.Match(SearchGrammarParserLPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}
		{
			p.SetState(61)
			p.search_expr(0)
		}
		{
			p.SetState(62)
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
			p.SetState(64)
			p.Negation_op()
		}
		{
			p.SetState(65)
			p.search_expr(5)
		}

	case 3:
		localctx = NewKey_val_search_exprContext(p, localctx)
		p.SetParserRuleContext(localctx)
		_prevctx = localctx
		{
			p.SetState(67)
			p.Search_key()
		}
		{
			p.SetState(68)
			p.Bin_op()
		}
		{
			p.SetState(69)
			p.Top_col_expr()
		}

	case 4:
		localctx = NewBody_search_exprContext(p, localctx)
		p.SetParserRuleContext(localctx)
		_prevctx = localctx
		{
			p.SetState(71)
			p.Top_col_expr()
		}

	case antlr.ATNInvalidAltNumber:
		goto errorExit
	}
	p.GetParserRuleContext().SetStop(p.GetTokenStream().LT(-1))
	p.SetState(83)
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
			p.SetState(81)
			p.GetErrorHandler().Sync(p)
			if p.HasError() {
				goto errorExit
			}

			switch p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 6, p.GetParserRuleContext()) {
			case 1:
				localctx = NewAnd_search_exprContext(p, NewSearch_exprContext(p, _parentctx, _parentState))
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_search_expr)
				p.SetState(74)

				if !(p.Precpred(p.GetParserRuleContext(), 4)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 4)", ""))
					goto errorExit
				}
				{
					p.SetState(75)
					p.And_op()
				}
				{
					p.SetState(76)
					p.search_expr(5)
				}

			case 2:
				localctx = NewOr_search_exprContext(p, NewSearch_exprContext(p, _parentctx, _parentState))
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_search_expr)
				p.SetState(78)

				if !(p.Precpred(p.GetParserRuleContext(), 3)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 3)", ""))
					goto errorExit
				}
				{
					p.SetState(79)
					p.Match(SearchGrammarParserOR)
					if p.HasError() {
						// Recognition error - abort rule
						goto errorExit
					}
				}
				{
					p.SetState(80)
					p.search_expr(4)
				}

			case antlr.ATNInvalidAltNumber:
				goto errorExit
			}

		}
		p.SetState(85)
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
		p.SetState(86)
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
	p.SetState(90)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}

	switch p.GetTokenStream().LA(1) {
	case SearchGrammarParserAND:
		p.EnterOuterAlt(localctx, 1)
		{
			p.SetState(88)
			p.Match(SearchGrammarParserAND)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	case SearchGrammarParserNOT, SearchGrammarParserLPAREN, SearchGrammarParserID, SearchGrammarParserVALUE:
		p.EnterOuterAlt(localctx, 2)

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
	p.EnterRule(localctx, 12, SearchGrammarParserRULE_or_op)
	p.EnterOuterAlt(localctx, 1)
	{
		p.SetState(92)
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
	p.EnterRule(localctx, 14, SearchGrammarParserRULE_negation_op)
	p.EnterOuterAlt(localctx, 1)
	{
		p.SetState(94)
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
	p.EnterRule(localctx, 16, SearchGrammarParserRULE_bin_op)
	var _la int

	p.EnterOuterAlt(localctx, 1)
	{
		p.SetState(96)
		_la = p.GetTokenStream().LA(1)

		if !((int64(_la) & ^0x3f) == 0 && ((int64(1)<<_la)&5104) != 0) {
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
	p.EnterRule(localctx, 18, SearchGrammarParserRULE_search_value)
	var _la int

	p.EnterOuterAlt(localctx, 1)
	{
		p.SetState(98)
		_la = p.GetTokenStream().LA(1)

		if !(_la == SearchGrammarParserID || _la == SearchGrammarParserVALUE) {
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
		return p.Precpred(p.GetParserRuleContext(), 4)

	case 3:
		return p.Precpred(p.GetParserRuleContext(), 3)

	default:
		panic("No predicate with index: " + fmt.Sprint(predIndex))
	}
}
