// Code generated from ./src/components/Search/Parser/SearchGrammar.g4 by ANTLR 4.13.1. DO NOT EDIT.

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
		"RPAREN", "COLON", "ID", "STRING", "WS",
	}
	staticData.RuleNames = []string{
		"search_query", "col_expr", "search_expr", "search_key", "bin_op",
	}
	staticData.PredictionContextCache = antlr.NewPredictionContextCache()
	staticData.serializedATN = []int32{
		4, 1, 15, 74, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7,
		4, 1, 0, 1, 0, 1, 0, 1, 0, 3, 0, 15, 8, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 26, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		1, 5, 1, 34, 8, 1, 10, 1, 12, 1, 37, 9, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2,
		1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 3, 2,
		55, 8, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 65, 8,
		2, 10, 2, 12, 2, 68, 9, 2, 1, 3, 1, 3, 1, 4, 1, 4, 1, 4, 0, 2, 2, 4, 5,
		0, 2, 4, 6, 8, 0, 1, 2, 0, 4, 9, 12, 12, 81, 0, 14, 1, 0, 0, 0, 2, 25,
		1, 0, 0, 0, 4, 54, 1, 0, 0, 0, 6, 69, 1, 0, 0, 0, 8, 71, 1, 0, 0, 0, 10,
		15, 5, 0, 0, 1, 11, 12, 3, 4, 2, 0, 12, 13, 5, 0, 0, 1, 13, 15, 1, 0, 0,
		0, 14, 10, 1, 0, 0, 0, 14, 11, 1, 0, 0, 0, 15, 1, 1, 0, 0, 0, 16, 17, 6,
		1, -1, 0, 17, 18, 5, 10, 0, 0, 18, 19, 3, 2, 1, 0, 19, 20, 5, 11, 0, 0,
		20, 26, 1, 0, 0, 0, 21, 22, 5, 3, 0, 0, 22, 26, 3, 2, 1, 3, 23, 26, 5,
		14, 0, 0, 24, 26, 5, 13, 0, 0, 25, 16, 1, 0, 0, 0, 25, 21, 1, 0, 0, 0,
		25, 23, 1, 0, 0, 0, 25, 24, 1, 0, 0, 0, 26, 35, 1, 0, 0, 0, 27, 28, 10,
		5, 0, 0, 28, 29, 5, 1, 0, 0, 29, 34, 3, 2, 1, 6, 30, 31, 10, 4, 0, 0, 31,
		32, 5, 2, 0, 0, 32, 34, 3, 2, 1, 5, 33, 27, 1, 0, 0, 0, 33, 30, 1, 0, 0,
		0, 34, 37, 1, 0, 0, 0, 35, 33, 1, 0, 0, 0, 35, 36, 1, 0, 0, 0, 36, 3, 1,
		0, 0, 0, 37, 35, 1, 0, 0, 0, 38, 39, 6, 2, -1, 0, 39, 40, 5, 10, 0, 0,
		40, 41, 3, 4, 2, 0, 41, 42, 5, 11, 0, 0, 42, 55, 1, 0, 0, 0, 43, 44, 5,
		10, 0, 0, 44, 45, 3, 4, 2, 0, 45, 46, 5, 11, 0, 0, 46, 55, 1, 0, 0, 0,
		47, 48, 5, 3, 0, 0, 48, 55, 3, 4, 2, 3, 49, 50, 3, 6, 3, 0, 50, 51, 3,
		8, 4, 0, 51, 52, 3, 2, 1, 0, 52, 55, 1, 0, 0, 0, 53, 55, 3, 2, 1, 0, 54,
		38, 1, 0, 0, 0, 54, 43, 1, 0, 0, 0, 54, 47, 1, 0, 0, 0, 54, 49, 1, 0, 0,
		0, 54, 53, 1, 0, 0, 0, 55, 66, 1, 0, 0, 0, 56, 57, 10, 6, 0, 0, 57, 58,
		5, 1, 0, 0, 58, 65, 3, 4, 2, 7, 59, 60, 10, 5, 0, 0, 60, 65, 3, 4, 2, 6,
		61, 62, 10, 4, 0, 0, 62, 63, 5, 2, 0, 0, 63, 65, 3, 4, 2, 5, 64, 56, 1,
		0, 0, 0, 64, 59, 1, 0, 0, 0, 64, 61, 1, 0, 0, 0, 65, 68, 1, 0, 0, 0, 66,
		64, 1, 0, 0, 0, 66, 67, 1, 0, 0, 0, 67, 5, 1, 0, 0, 0, 68, 66, 1, 0, 0,
		0, 69, 70, 5, 13, 0, 0, 70, 7, 1, 0, 0, 0, 71, 72, 7, 0, 0, 0, 72, 9, 1,
		0, 0, 0, 7, 14, 25, 33, 35, 54, 64, 66,
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
	SearchGrammarParserWS     = 15
)

// SearchGrammarParser rules.
const (
	SearchGrammarParserRULE_search_query = 0
	SearchGrammarParserRULE_col_expr     = 1
	SearchGrammarParserRULE_search_expr  = 2
	SearchGrammarParserRULE_search_key   = 3
	SearchGrammarParserRULE_bin_op       = 4
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
	p.SetState(14)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}

	switch p.GetTokenStream().LA(1) {
	case SearchGrammarParserEOF:
		p.EnterOuterAlt(localctx, 1)
		{
			p.SetState(10)
			p.Match(SearchGrammarParserEOF)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	case SearchGrammarParserNOT, SearchGrammarParserLPAREN, SearchGrammarParserID, SearchGrammarParserSTRING:
		p.EnterOuterAlt(localctx, 2)
		{
			p.SetState(11)
			p.search_expr(0)
		}
		{
			p.SetState(12)
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

// ICol_exprContext is an interface to support dynamic dispatch.
type ICol_exprContext interface {
	antlr.ParserRuleContext

	// GetParser returns the parser.
	GetParser() antlr.Parser

	// Getter signatures
	LPAREN() antlr.TerminalNode
	AllCol_expr() []ICol_exprContext
	Col_expr(i int) ICol_exprContext
	RPAREN() antlr.TerminalNode
	NOT() antlr.TerminalNode
	STRING() antlr.TerminalNode
	ID() antlr.TerminalNode
	AND() antlr.TerminalNode
	OR() antlr.TerminalNode

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

func (s *Col_exprContext) LPAREN() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserLPAREN, 0)
}

func (s *Col_exprContext) AllCol_expr() []ICol_exprContext {
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

func (s *Col_exprContext) Col_expr(i int) ICol_exprContext {
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

func (s *Col_exprContext) RPAREN() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserRPAREN, 0)
}

func (s *Col_exprContext) NOT() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserNOT, 0)
}

func (s *Col_exprContext) STRING() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserSTRING, 0)
}

func (s *Col_exprContext) ID() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserID, 0)
}

func (s *Col_exprContext) AND() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserAND, 0)
}

func (s *Col_exprContext) OR() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserOR, 0)
}

func (s *Col_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Col_exprContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

func (s *Col_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterCol_expr(s)
	}
}

func (s *Col_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitCol_expr(s)
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
	_startState := 2
	p.EnterRecursionRule(localctx, 2, SearchGrammarParserRULE_col_expr, _p)
	var _alt int

	p.EnterOuterAlt(localctx, 1)
	p.SetState(25)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}

	switch p.GetTokenStream().LA(1) {
	case SearchGrammarParserLPAREN:
		{
			p.SetState(17)
			p.Match(SearchGrammarParserLPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}
		{
			p.SetState(18)
			p.col_expr(0)
		}
		{
			p.SetState(19)
			p.Match(SearchGrammarParserRPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	case SearchGrammarParserNOT:
		{
			p.SetState(21)
			p.Match(SearchGrammarParserNOT)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}
		{
			p.SetState(22)
			p.col_expr(3)
		}

	case SearchGrammarParserSTRING:
		{
			p.SetState(23)
			p.Match(SearchGrammarParserSTRING)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	case SearchGrammarParserID:
		{
			p.SetState(24)
			p.Match(SearchGrammarParserID)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	default:
		p.SetError(antlr.NewNoViableAltException(p, nil, nil, nil, nil, nil))
		goto errorExit
	}
	p.GetParserRuleContext().SetStop(p.GetTokenStream().LT(-1))
	p.SetState(35)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}
	_alt = p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 3, p.GetParserRuleContext())
	if p.HasError() {
		goto errorExit
	}
	for _alt != 2 && _alt != antlr.ATNInvalidAltNumber {
		if _alt == 1 {
			if p.GetParseListeners() != nil {
				p.TriggerExitRuleEvent()
			}
			_prevctx = localctx
			p.SetState(33)
			p.GetErrorHandler().Sync(p)
			if p.HasError() {
				goto errorExit
			}

			switch p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 2, p.GetParserRuleContext()) {
			case 1:
				localctx = NewCol_exprContext(p, _parentctx, _parentState)
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_col_expr)
				p.SetState(27)

				if !(p.Precpred(p.GetParserRuleContext(), 5)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 5)", ""))
					goto errorExit
				}
				{
					p.SetState(28)
					p.Match(SearchGrammarParserAND)
					if p.HasError() {
						// Recognition error - abort rule
						goto errorExit
					}
				}
				{
					p.SetState(29)
					p.col_expr(6)
				}

			case 2:
				localctx = NewCol_exprContext(p, _parentctx, _parentState)
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_col_expr)
				p.SetState(30)

				if !(p.Precpred(p.GetParserRuleContext(), 4)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 4)", ""))
					goto errorExit
				}
				{
					p.SetState(31)
					p.Match(SearchGrammarParserOR)
					if p.HasError() {
						// Recognition error - abort rule
						goto errorExit
					}
				}
				{
					p.SetState(32)
					p.col_expr(5)
				}

			case antlr.ATNInvalidAltNumber:
				goto errorExit
			}

		}
		p.SetState(37)
		p.GetErrorHandler().Sync(p)
		if p.HasError() {
			goto errorExit
		}
		_alt = p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 3, p.GetParserRuleContext())
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

	// Getter signatures
	LPAREN() antlr.TerminalNode
	AllSearch_expr() []ISearch_exprContext
	Search_expr(i int) ISearch_exprContext
	RPAREN() antlr.TerminalNode
	NOT() antlr.TerminalNode
	Search_key() ISearch_keyContext
	Bin_op() IBin_opContext
	Col_expr() ICol_exprContext
	AND() antlr.TerminalNode
	OR() antlr.TerminalNode

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

func (s *Search_exprContext) LPAREN() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserLPAREN, 0)
}

func (s *Search_exprContext) AllSearch_expr() []ISearch_exprContext {
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

func (s *Search_exprContext) Search_expr(i int) ISearch_exprContext {
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

func (s *Search_exprContext) RPAREN() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserRPAREN, 0)
}

func (s *Search_exprContext) NOT() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserNOT, 0)
}

func (s *Search_exprContext) Search_key() ISearch_keyContext {
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

func (s *Search_exprContext) Bin_op() IBin_opContext {
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

func (s *Search_exprContext) Col_expr() ICol_exprContext {
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

func (s *Search_exprContext) AND() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserAND, 0)
}

func (s *Search_exprContext) OR() antlr.TerminalNode {
	return s.GetToken(SearchGrammarParserOR, 0)
}

func (s *Search_exprContext) GetRuleContext() antlr.RuleContext {
	return s
}

func (s *Search_exprContext) ToStringTree(ruleNames []string, recog antlr.Recognizer) string {
	return antlr.TreesStringTree(s, ruleNames, recog)
}

func (s *Search_exprContext) EnterRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.EnterSearch_expr(s)
	}
}

func (s *Search_exprContext) ExitRule(listener antlr.ParseTreeListener) {
	if listenerT, ok := listener.(SearchGrammarListener); ok {
		listenerT.ExitSearch_expr(s)
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
	_startState := 4
	p.EnterRecursionRule(localctx, 4, SearchGrammarParserRULE_search_expr, _p)
	var _alt int

	p.EnterOuterAlt(localctx, 1)
	p.SetState(54)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}

	switch p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 4, p.GetParserRuleContext()) {
	case 1:
		{
			p.SetState(39)
			p.Match(SearchGrammarParserLPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}
		{
			p.SetState(40)
			p.search_expr(0)
		}
		{
			p.SetState(41)
			p.Match(SearchGrammarParserRPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	case 2:
		{
			p.SetState(43)
			p.Match(SearchGrammarParserLPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}
		{
			p.SetState(44)
			p.search_expr(0)
		}
		{
			p.SetState(45)
			p.Match(SearchGrammarParserRPAREN)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}

	case 3:
		{
			p.SetState(47)
			p.Match(SearchGrammarParserNOT)
			if p.HasError() {
				// Recognition error - abort rule
				goto errorExit
			}
		}
		{
			p.SetState(48)
			p.search_expr(3)
		}

	case 4:
		{
			p.SetState(49)
			p.Search_key()
		}
		{
			p.SetState(50)
			p.Bin_op()
		}
		{
			p.SetState(51)
			p.col_expr(0)
		}

	case 5:
		{
			p.SetState(53)
			p.col_expr(0)
		}

	case antlr.ATNInvalidAltNumber:
		goto errorExit
	}
	p.GetParserRuleContext().SetStop(p.GetTokenStream().LT(-1))
	p.SetState(66)
	p.GetErrorHandler().Sync(p)
	if p.HasError() {
		goto errorExit
	}
	_alt = p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 6, p.GetParserRuleContext())
	if p.HasError() {
		goto errorExit
	}
	for _alt != 2 && _alt != antlr.ATNInvalidAltNumber {
		if _alt == 1 {
			if p.GetParseListeners() != nil {
				p.TriggerExitRuleEvent()
			}
			_prevctx = localctx
			p.SetState(64)
			p.GetErrorHandler().Sync(p)
			if p.HasError() {
				goto errorExit
			}

			switch p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 5, p.GetParserRuleContext()) {
			case 1:
				localctx = NewSearch_exprContext(p, _parentctx, _parentState)
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_search_expr)
				p.SetState(56)

				if !(p.Precpred(p.GetParserRuleContext(), 6)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 6)", ""))
					goto errorExit
				}
				{
					p.SetState(57)
					p.Match(SearchGrammarParserAND)
					if p.HasError() {
						// Recognition error - abort rule
						goto errorExit
					}
				}
				{
					p.SetState(58)
					p.search_expr(7)
				}

			case 2:
				localctx = NewSearch_exprContext(p, _parentctx, _parentState)
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_search_expr)
				p.SetState(59)

				if !(p.Precpred(p.GetParserRuleContext(), 5)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 5)", ""))
					goto errorExit
				}
				{
					p.SetState(60)
					p.search_expr(6)
				}

			case 3:
				localctx = NewSearch_exprContext(p, _parentctx, _parentState)
				p.PushNewRecursionContext(localctx, _startState, SearchGrammarParserRULE_search_expr)
				p.SetState(61)

				if !(p.Precpred(p.GetParserRuleContext(), 4)) {
					p.SetError(antlr.NewFailedPredicateException(p, "p.Precpred(p.GetParserRuleContext(), 4)", ""))
					goto errorExit
				}
				{
					p.SetState(62)
					p.Match(SearchGrammarParserOR)
					if p.HasError() {
						// Recognition error - abort rule
						goto errorExit
					}
				}
				{
					p.SetState(63)
					p.search_expr(5)
				}

			case antlr.ATNInvalidAltNumber:
				goto errorExit
			}

		}
		p.SetState(68)
		p.GetErrorHandler().Sync(p)
		if p.HasError() {
			goto errorExit
		}
		_alt = p.GetInterpreter().AdaptivePredict(p.BaseParser, p.GetTokenStream(), 6, p.GetParserRuleContext())
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
	p.EnterRule(localctx, 6, SearchGrammarParserRULE_search_key)
	p.EnterOuterAlt(localctx, 1)
	{
		p.SetState(69)
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
	p.EnterRule(localctx, 8, SearchGrammarParserRULE_bin_op)
	var _la int

	p.EnterOuterAlt(localctx, 1)
	{
		p.SetState(71)
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

func (p *SearchGrammarParser) Sempred(localctx antlr.RuleContext, ruleIndex, predIndex int) bool {
	switch ruleIndex {
	case 1:
		var t *Col_exprContext = nil
		if localctx != nil {
			t = localctx.(*Col_exprContext)
		}
		return p.Col_expr_Sempred(t, predIndex)

	case 2:
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
		return p.Precpred(p.GetParserRuleContext(), 5)

	case 1:
		return p.Precpred(p.GetParserRuleContext(), 4)

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
