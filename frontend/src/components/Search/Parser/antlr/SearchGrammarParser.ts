// Generated from ./antlr/SearchGrammar.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer,
	DecisionState,
	DFA,
	FailedPredicateException,
	RecognitionException,
	NoViableAltException,
	BailErrorStrategy,
	Parser,
	ParserATNSimulator,
	RuleContext,
	ParserRuleContext,
	PredictionMode,
	PredictionContextCache,
	TerminalNode,
	RuleNode,
	Token,
	TokenStream,
	Interval,
	IntervalSet,
} from 'antlr4'
import SearchGrammarListener from './SearchGrammarListener.js'
// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number

export default class SearchGrammarParser extends Parser {
	public static readonly AND = 1
	public static readonly OR = 2
	public static readonly NOT = 3
	public static readonly EQ = 4
	public static readonly NEQ = 5
	public static readonly LT = 6
	public static readonly LTE = 7
	public static readonly GT = 8
	public static readonly GTE = 9
	public static readonly LPAREN = 10
	public static readonly RPAREN = 11
	public static readonly COLON = 12
	public static readonly ID = 13
	public static readonly STRING = 14
	public static readonly WS = 15
	public static readonly EOF = Token.EOF
	public static readonly RULE_search_query = 0
	public static readonly RULE_col_expr = 1
	public static readonly RULE_search_expr = 2
	public static readonly RULE_search_key = 3
	public static readonly RULE_search_op = 4
	public static readonly RULE_negation_op = 5
	public static readonly RULE_bin_op = 6
	public static readonly RULE_search_value = 7
	public static readonly literalNames: (string | null)[] = [
		null,
		"'AND'",
		"'OR'",
		"'NOT'",
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
		'WS',
	]
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		'search_query',
		'col_expr',
		'search_expr',
		'search_key',
		'search_op',
		'negation_op',
		'bin_op',
		'search_value',
	]
	public get grammarFileName(): string {
		return 'SearchGrammar.g4'
	}
	public get literalNames(): (string | null)[] {
		return SearchGrammarParser.literalNames
	}
	public get symbolicNames(): (string | null)[] {
		return SearchGrammarParser.symbolicNames
	}
	public get ruleNames(): string[] {
		return SearchGrammarParser.ruleNames
	}
	public get serializedATN(): number[] {
		return SearchGrammarParser._serializedATN
	}

	protected createFailedPredicateException(
		predicate?: string,
		message?: string,
	): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message)
	}

	constructor(input: TokenStream) {
		super(input)
		this._interp = new ParserATNSimulator(
			this,
			SearchGrammarParser._ATN,
			SearchGrammarParser.DecisionsToDFA,
			new PredictionContextCache(),
		)
	}
	// @RuleVersion(0)
	public search_query(): Search_queryContext {
		let localctx: Search_queryContext = new Search_queryContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 0, SearchGrammarParser.RULE_search_query)
		try {
			this.state = 20
			this._errHandler.sync(this)
			switch (this._input.LA(1)) {
				case -1:
					this.enterOuterAlt(localctx, 1)
					{
						this.state = 16
						this.match(SearchGrammarParser.EOF)
					}
					break
				case 3:
				case 10:
				case 13:
				case 14:
					this.enterOuterAlt(localctx, 2)
					{
						this.state = 17
						this.search_expr(0)
						this.state = 18
						this.match(SearchGrammarParser.EOF)
					}
					break
				default:
					throw new NoViableAltException(this)
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re
				this._errHandler.reportError(this, re)
				this._errHandler.recover(this, re)
			} else {
				throw re
			}
		} finally {
			this.exitRule()
		}
		return localctx
	}
	// @RuleVersion(0)
	public col_expr(): Col_exprContext {
		let localctx: Col_exprContext = new Col_exprContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 2, SearchGrammarParser.RULE_col_expr)
		try {
			this.state = 38
			this._errHandler.sync(this)
			switch (this._interp.adaptivePredict(this._input, 1, this._ctx)) {
				case 1:
					this.enterOuterAlt(localctx, 1)
					{
						this.state = 22
						this.match(SearchGrammarParser.LPAREN)
						this.state = 23
						this.col_expr()
						this.state = 24
						this.match(SearchGrammarParser.RPAREN)
					}
					break
				case 2:
					this.enterOuterAlt(localctx, 2)
					{
						this.state = 26
						this.search_value()
						this.state = 27
						this.search_op()
						this.state = 28
						this.search_value()
					}
					break
				case 3:
					this.enterOuterAlt(localctx, 3)
					{
						this.state = 30
						this.search_value()
						this.state = 31
						this.search_op()
						this.state = 32
						this.search_value()
					}
					break
				case 4:
					this.enterOuterAlt(localctx, 4)
					{
						this.state = 34
						this.negation_op()
						this.state = 35
						this.col_expr()
					}
					break
				case 5:
					this.enterOuterAlt(localctx, 5)
					{
						this.state = 37
						this.search_value()
					}
					break
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re
				this._errHandler.reportError(this, re)
				this._errHandler.recover(this, re)
			} else {
				throw re
			}
		} finally {
			this.exitRule()
		}
		return localctx
	}

	public search_expr(): Search_exprContext
	public search_expr(_p: number): Search_exprContext
	// @RuleVersion(0)
	public search_expr(_p?: number): Search_exprContext {
		if (_p === undefined) {
			_p = 0
		}

		let _parentctx: ParserRuleContext = this._ctx
		let _parentState: number = this.state
		let localctx: Search_exprContext = new Search_exprContext(
			this,
			this._ctx,
			_parentState,
		)
		let _prevctx: Search_exprContext = localctx
		let _startState: number = 4
		this.enterRecursionRule(
			localctx,
			4,
			SearchGrammarParser.RULE_search_expr,
			_p,
		)
		try {
			let _alt: number
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 57
				this._errHandler.sync(this)
				switch (
					this._interp.adaptivePredict(this._input, 2, this._ctx)
				) {
					case 1:
						{
							this.state = 41
							this.match(SearchGrammarParser.LPAREN)
							this.state = 42
							this.search_expr(0)
							this.state = 43
							this.match(SearchGrammarParser.RPAREN)
						}
						break
					case 2:
						{
							this.state = 45
							this.match(SearchGrammarParser.LPAREN)
							this.state = 46
							this.search_expr(0)
							this.state = 47
							this.match(SearchGrammarParser.RPAREN)
						}
						break
					case 3:
						{
							this.state = 49
							this.negation_op()
							this.state = 50
							this.search_expr(3)
						}
						break
					case 4:
						{
							this.state = 52
							this.search_key()
							this.state = 53
							this.bin_op()
							this.state = 54
							this.col_expr()
						}
						break
					case 5:
						{
							this.state = 56
							this.col_expr()
						}
						break
				}
				this._ctx.stop = this._input.LT(-1)
				this.state = 71
				this._errHandler.sync(this)
				_alt = this._interp.adaptivePredict(this._input, 4, this._ctx)
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						if (this._parseListeners != null) {
							this.triggerExitRuleEvent()
						}
						_prevctx = localctx
						{
							this.state = 69
							this._errHandler.sync(this)
							switch (
								this._interp.adaptivePredict(
									this._input,
									3,
									this._ctx,
								)
							) {
								case 1:
									{
										localctx = new Search_exprContext(
											this,
											_parentctx,
											_parentState,
										)
										this.pushNewRecursionContext(
											localctx,
											_startState,
											SearchGrammarParser.RULE_search_expr,
										)
										this.state = 59
										if (!this.precpred(this._ctx, 6)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 6)',
											)
										}
										this.state = 60
										this.search_op()
										this.state = 61
										this.search_expr(7)
									}
									break
								case 2:
									{
										localctx = new Search_exprContext(
											this,
											_parentctx,
											_parentState,
										)
										this.pushNewRecursionContext(
											localctx,
											_startState,
											SearchGrammarParser.RULE_search_expr,
										)
										this.state = 63
										if (!this.precpred(this._ctx, 5)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 5)',
											)
										}
										this.state = 64
										this.search_expr(6)
									}
									break
								case 3:
									{
										localctx = new Search_exprContext(
											this,
											_parentctx,
											_parentState,
										)
										this.pushNewRecursionContext(
											localctx,
											_startState,
											SearchGrammarParser.RULE_search_expr,
										)
										this.state = 65
										if (!this.precpred(this._ctx, 4)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 4)',
											)
										}
										this.state = 66
										this.search_op()
										this.state = 67
										this.search_expr(5)
									}
									break
							}
						}
					}
					this.state = 73
					this._errHandler.sync(this)
					_alt = this._interp.adaptivePredict(
						this._input,
						4,
						this._ctx,
					)
				}
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re
				this._errHandler.reportError(this, re)
				this._errHandler.recover(this, re)
			} else {
				throw re
			}
		} finally {
			this.unrollRecursionContexts(_parentctx)
		}
		return localctx
	}
	// @RuleVersion(0)
	public search_key(): Search_keyContext {
		let localctx: Search_keyContext = new Search_keyContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 6, SearchGrammarParser.RULE_search_key)
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 74
				this.match(SearchGrammarParser.ID)
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re
				this._errHandler.reportError(this, re)
				this._errHandler.recover(this, re)
			} else {
				throw re
			}
		} finally {
			this.exitRule()
		}
		return localctx
	}
	// @RuleVersion(0)
	public search_op(): Search_opContext {
		let localctx: Search_opContext = new Search_opContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 8, SearchGrammarParser.RULE_search_op)
		let _la: number
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 76
				_la = this._input.LA(1)
				if (!(_la === 1 || _la === 2)) {
					this._errHandler.recoverInline(this)
				} else {
					this._errHandler.reportMatch(this)
					this.consume()
				}
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re
				this._errHandler.reportError(this, re)
				this._errHandler.recover(this, re)
			} else {
				throw re
			}
		} finally {
			this.exitRule()
		}
		return localctx
	}
	// @RuleVersion(0)
	public negation_op(): Negation_opContext {
		let localctx: Negation_opContext = new Negation_opContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 10, SearchGrammarParser.RULE_negation_op)
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 78
				this.match(SearchGrammarParser.NOT)
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re
				this._errHandler.reportError(this, re)
				this._errHandler.recover(this, re)
			} else {
				throw re
			}
		} finally {
			this.exitRule()
		}
		return localctx
	}
	// @RuleVersion(0)
	public bin_op(): Bin_opContext {
		let localctx: Bin_opContext = new Bin_opContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 12, SearchGrammarParser.RULE_bin_op)
		let _la: number
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 80
				_la = this._input.LA(1)
				if (!((_la & ~0x1f) === 0 && ((1 << _la) & 5104) !== 0)) {
					this._errHandler.recoverInline(this)
				} else {
					this._errHandler.reportMatch(this)
					this.consume()
				}
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re
				this._errHandler.reportError(this, re)
				this._errHandler.recover(this, re)
			} else {
				throw re
			}
		} finally {
			this.exitRule()
		}
		return localctx
	}
	// @RuleVersion(0)
	public search_value(): Search_valueContext {
		let localctx: Search_valueContext = new Search_valueContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 14, SearchGrammarParser.RULE_search_value)
		let _la: number
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 82
				_la = this._input.LA(1)
				if (!(_la === 13 || _la === 14)) {
					this._errHandler.recoverInline(this)
				} else {
					this._errHandler.reportMatch(this)
					this.consume()
				}
			}
		} catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re
				this._errHandler.reportError(this, re)
				this._errHandler.recover(this, re)
			} else {
				throw re
			}
		} finally {
			this.exitRule()
		}
		return localctx
	}

	public sempred(
		localctx: RuleContext,
		ruleIndex: number,
		predIndex: number,
	): boolean {
		switch (ruleIndex) {
			case 2:
				return this.search_expr_sempred(
					localctx as Search_exprContext,
					predIndex,
				)
		}
		return true
	}
	private search_expr_sempred(
		localctx: Search_exprContext,
		predIndex: number,
	): boolean {
		switch (predIndex) {
			case 0:
				return this.precpred(this._ctx, 6)
			case 1:
				return this.precpred(this._ctx, 5)
			case 2:
				return this.precpred(this._ctx, 4)
		}
		return true
	}

	public static readonly _serializedATN: number[] = [
		4, 1, 15, 85, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7,
		4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 1, 0, 1, 0, 1, 0, 1, 0, 3, 0, 21,
		8, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 39, 8, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1,
		2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1,
		2, 3, 2, 58, 8, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2,
		1, 2, 5, 2, 70, 8, 2, 10, 2, 12, 2, 73, 9, 2, 1, 3, 1, 3, 1, 4, 1, 4, 1,
		5, 1, 5, 1, 6, 1, 6, 1, 7, 1, 7, 1, 7, 0, 1, 4, 8, 0, 2, 4, 6, 8, 10,
		12, 14, 0, 3, 1, 0, 1, 2, 2, 0, 4, 9, 12, 12, 1, 0, 13, 14, 88, 0, 20,
		1, 0, 0, 0, 2, 38, 1, 0, 0, 0, 4, 57, 1, 0, 0, 0, 6, 74, 1, 0, 0, 0, 8,
		76, 1, 0, 0, 0, 10, 78, 1, 0, 0, 0, 12, 80, 1, 0, 0, 0, 14, 82, 1, 0, 0,
		0, 16, 21, 5, 0, 0, 1, 17, 18, 3, 4, 2, 0, 18, 19, 5, 0, 0, 1, 19, 21,
		1, 0, 0, 0, 20, 16, 1, 0, 0, 0, 20, 17, 1, 0, 0, 0, 21, 1, 1, 0, 0, 0,
		22, 23, 5, 10, 0, 0, 23, 24, 3, 2, 1, 0, 24, 25, 5, 11, 0, 0, 25, 39, 1,
		0, 0, 0, 26, 27, 3, 14, 7, 0, 27, 28, 3, 8, 4, 0, 28, 29, 3, 14, 7, 0,
		29, 39, 1, 0, 0, 0, 30, 31, 3, 14, 7, 0, 31, 32, 3, 8, 4, 0, 32, 33, 3,
		14, 7, 0, 33, 39, 1, 0, 0, 0, 34, 35, 3, 10, 5, 0, 35, 36, 3, 2, 1, 0,
		36, 39, 1, 0, 0, 0, 37, 39, 3, 14, 7, 0, 38, 22, 1, 0, 0, 0, 38, 26, 1,
		0, 0, 0, 38, 30, 1, 0, 0, 0, 38, 34, 1, 0, 0, 0, 38, 37, 1, 0, 0, 0, 39,
		3, 1, 0, 0, 0, 40, 41, 6, 2, -1, 0, 41, 42, 5, 10, 0, 0, 42, 43, 3, 4,
		2, 0, 43, 44, 5, 11, 0, 0, 44, 58, 1, 0, 0, 0, 45, 46, 5, 10, 0, 0, 46,
		47, 3, 4, 2, 0, 47, 48, 5, 11, 0, 0, 48, 58, 1, 0, 0, 0, 49, 50, 3, 10,
		5, 0, 50, 51, 3, 4, 2, 3, 51, 58, 1, 0, 0, 0, 52, 53, 3, 6, 3, 0, 53,
		54, 3, 12, 6, 0, 54, 55, 3, 2, 1, 0, 55, 58, 1, 0, 0, 0, 56, 58, 3, 2,
		1, 0, 57, 40, 1, 0, 0, 0, 57, 45, 1, 0, 0, 0, 57, 49, 1, 0, 0, 0, 57,
		52, 1, 0, 0, 0, 57, 56, 1, 0, 0, 0, 58, 71, 1, 0, 0, 0, 59, 60, 10, 6,
		0, 0, 60, 61, 3, 8, 4, 0, 61, 62, 3, 4, 2, 7, 62, 70, 1, 0, 0, 0, 63,
		64, 10, 5, 0, 0, 64, 70, 3, 4, 2, 6, 65, 66, 10, 4, 0, 0, 66, 67, 3, 8,
		4, 0, 67, 68, 3, 4, 2, 5, 68, 70, 1, 0, 0, 0, 69, 59, 1, 0, 0, 0, 69,
		63, 1, 0, 0, 0, 69, 65, 1, 0, 0, 0, 70, 73, 1, 0, 0, 0, 71, 69, 1, 0, 0,
		0, 71, 72, 1, 0, 0, 0, 72, 5, 1, 0, 0, 0, 73, 71, 1, 0, 0, 0, 74, 75, 5,
		13, 0, 0, 75, 7, 1, 0, 0, 0, 76, 77, 7, 0, 0, 0, 77, 9, 1, 0, 0, 0, 78,
		79, 5, 3, 0, 0, 79, 11, 1, 0, 0, 0, 80, 81, 7, 1, 0, 0, 81, 13, 1, 0, 0,
		0, 82, 83, 7, 2, 0, 0, 83, 15, 1, 0, 0, 0, 5, 20, 38, 57, 69, 71,
	]

	private static __ATN: ATN
	public static get _ATN(): ATN {
		if (!SearchGrammarParser.__ATN) {
			SearchGrammarParser.__ATN = new ATNDeserializer().deserialize(
				SearchGrammarParser._serializedATN,
			)
		}

		return SearchGrammarParser.__ATN
	}

	static DecisionsToDFA = SearchGrammarParser._ATN.decisionToState.map(
		(ds: DecisionState, index: number) => new DFA(ds, index),
	)
}

export class Search_queryContext extends ParserRuleContext {
	constructor(
		parser?: SearchGrammarParser,
		parent?: ParserRuleContext,
		invokingState?: number,
	) {
		super(parent, invokingState)
		this.parser = parser
	}
	public EOF(): TerminalNode {
		return this.getToken(SearchGrammarParser.EOF, 0)
	}
	public search_expr(): Search_exprContext {
		return this.getTypedRuleContext(
			Search_exprContext,
			0,
		) as Search_exprContext
	}
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_search_query
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterSearch_query) {
			listener.enterSearch_query(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitSearch_query) {
			listener.exitSearch_query(this)
		}
	}
}

export class Col_exprContext extends ParserRuleContext {
	constructor(
		parser?: SearchGrammarParser,
		parent?: ParserRuleContext,
		invokingState?: number,
	) {
		super(parent, invokingState)
		this.parser = parser
	}
	public LPAREN(): TerminalNode {
		return this.getToken(SearchGrammarParser.LPAREN, 0)
	}
	public col_expr(): Col_exprContext {
		return this.getTypedRuleContext(Col_exprContext, 0) as Col_exprContext
	}
	public RPAREN(): TerminalNode {
		return this.getToken(SearchGrammarParser.RPAREN, 0)
	}
	public search_value_list(): Search_valueContext[] {
		return this.getTypedRuleContexts(
			Search_valueContext,
		) as Search_valueContext[]
	}
	public search_value(i: number): Search_valueContext {
		return this.getTypedRuleContext(
			Search_valueContext,
			i,
		) as Search_valueContext
	}
	public search_op(): Search_opContext {
		return this.getTypedRuleContext(Search_opContext, 0) as Search_opContext
	}
	public negation_op(): Negation_opContext {
		return this.getTypedRuleContext(
			Negation_opContext,
			0,
		) as Negation_opContext
	}
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_col_expr
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterCol_expr) {
			listener.enterCol_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitCol_expr) {
			listener.exitCol_expr(this)
		}
	}
}

export class Search_exprContext extends ParserRuleContext {
	constructor(
		parser?: SearchGrammarParser,
		parent?: ParserRuleContext,
		invokingState?: number,
	) {
		super(parent, invokingState)
		this.parser = parser
	}
	public LPAREN(): TerminalNode {
		return this.getToken(SearchGrammarParser.LPAREN, 0)
	}
	public search_expr_list(): Search_exprContext[] {
		return this.getTypedRuleContexts(
			Search_exprContext,
		) as Search_exprContext[]
	}
	public search_expr(i: number): Search_exprContext {
		return this.getTypedRuleContext(
			Search_exprContext,
			i,
		) as Search_exprContext
	}
	public RPAREN(): TerminalNode {
		return this.getToken(SearchGrammarParser.RPAREN, 0)
	}
	public negation_op(): Negation_opContext {
		return this.getTypedRuleContext(
			Negation_opContext,
			0,
		) as Negation_opContext
	}
	public search_key(): Search_keyContext {
		return this.getTypedRuleContext(
			Search_keyContext,
			0,
		) as Search_keyContext
	}
	public bin_op(): Bin_opContext {
		return this.getTypedRuleContext(Bin_opContext, 0) as Bin_opContext
	}
	public col_expr(): Col_exprContext {
		return this.getTypedRuleContext(Col_exprContext, 0) as Col_exprContext
	}
	public search_op(): Search_opContext {
		return this.getTypedRuleContext(Search_opContext, 0) as Search_opContext
	}
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_search_expr
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterSearch_expr) {
			listener.enterSearch_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitSearch_expr) {
			listener.exitSearch_expr(this)
		}
	}
}

export class Search_keyContext extends ParserRuleContext {
	constructor(
		parser?: SearchGrammarParser,
		parent?: ParserRuleContext,
		invokingState?: number,
	) {
		super(parent, invokingState)
		this.parser = parser
	}
	public ID(): TerminalNode {
		return this.getToken(SearchGrammarParser.ID, 0)
	}
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_search_key
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterSearch_key) {
			listener.enterSearch_key(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitSearch_key) {
			listener.exitSearch_key(this)
		}
	}
}

export class Search_opContext extends ParserRuleContext {
	constructor(
		parser?: SearchGrammarParser,
		parent?: ParserRuleContext,
		invokingState?: number,
	) {
		super(parent, invokingState)
		this.parser = parser
	}
	public AND(): TerminalNode {
		return this.getToken(SearchGrammarParser.AND, 0)
	}
	public OR(): TerminalNode {
		return this.getToken(SearchGrammarParser.OR, 0)
	}
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_search_op
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterSearch_op) {
			listener.enterSearch_op(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitSearch_op) {
			listener.exitSearch_op(this)
		}
	}
}

export class Negation_opContext extends ParserRuleContext {
	constructor(
		parser?: SearchGrammarParser,
		parent?: ParserRuleContext,
		invokingState?: number,
	) {
		super(parent, invokingState)
		this.parser = parser
	}
	public NOT(): TerminalNode {
		return this.getToken(SearchGrammarParser.NOT, 0)
	}
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_negation_op
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterNegation_op) {
			listener.enterNegation_op(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitNegation_op) {
			listener.exitNegation_op(this)
		}
	}
}

export class Bin_opContext extends ParserRuleContext {
	constructor(
		parser?: SearchGrammarParser,
		parent?: ParserRuleContext,
		invokingState?: number,
	) {
		super(parent, invokingState)
		this.parser = parser
	}
	public EQ(): TerminalNode {
		return this.getToken(SearchGrammarParser.EQ, 0)
	}
	public NEQ(): TerminalNode {
		return this.getToken(SearchGrammarParser.NEQ, 0)
	}
	public GT(): TerminalNode {
		return this.getToken(SearchGrammarParser.GT, 0)
	}
	public GTE(): TerminalNode {
		return this.getToken(SearchGrammarParser.GTE, 0)
	}
	public LT(): TerminalNode {
		return this.getToken(SearchGrammarParser.LT, 0)
	}
	public LTE(): TerminalNode {
		return this.getToken(SearchGrammarParser.LTE, 0)
	}
	public COLON(): TerminalNode {
		return this.getToken(SearchGrammarParser.COLON, 0)
	}
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_bin_op
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterBin_op) {
			listener.enterBin_op(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitBin_op) {
			listener.exitBin_op(this)
		}
	}
}

export class Search_valueContext extends ParserRuleContext {
	constructor(
		parser?: SearchGrammarParser,
		parent?: ParserRuleContext,
		invokingState?: number,
	) {
		super(parent, invokingState)
		this.parser = parser
	}
	public ID(): TerminalNode {
		return this.getToken(SearchGrammarParser.ID, 0)
	}
	public STRING(): TerminalNode {
		return this.getToken(SearchGrammarParser.STRING, 0)
	}
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_search_value
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterSearch_value) {
			listener.enterSearch_value(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitSearch_value) {
			listener.exitSearch_value(this)
		}
	}
}
