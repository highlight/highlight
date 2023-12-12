// Generated from ./src/components/Search/Parser/SearchGrammar.g4 by ANTLR 4.13.1
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
	public static readonly COMMA = 10
	public static readonly SEMI = 11
	public static readonly QUOT = 12
	public static readonly LPAREN = 13
	public static readonly RPAREN = 14
	public static readonly LCURLY = 15
	public static readonly RCURLY = 16
	public static readonly COLON = 17
	public static readonly ID = 18
	public static readonly STRING = 19
	public static readonly WS = 20
	public static readonly EOF = Token.EOF
	public static readonly RULE_search_query = 0
	public static readonly RULE_col_expr = 1
	public static readonly RULE_search_expr = 2
	public static readonly RULE_search_key = 3
	public static readonly RULE_bin_op = 4
	public static readonly RULE_spaces = 5
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
		"','",
		"';'",
		"'\"'",
		"'('",
		"')'",
		"'{'",
		"'}'",
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
		'COMMA',
		'SEMI',
		'QUOT',
		'LPAREN',
		'RPAREN',
		'LCURLY',
		'RCURLY',
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
		'bin_op',
		'spaces',
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
			this.state = 17
			this._errHandler.sync(this)
			switch (this._input.LA(1)) {
				case -1:
					this.enterOuterAlt(localctx, 1)
					{
						this.state = 12
						this.match(SearchGrammarParser.EOF)
					}
					break
				case 3:
				case 13:
				case 18:
				case 19:
				case 20:
					this.enterOuterAlt(localctx, 2)
					{
						this.state = 13
						this.spaces()
						this.state = 14
						this.search_expr(0)
						this.state = 15
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

	public col_expr(): Col_exprContext
	public col_expr(_p: number): Col_exprContext
	// @RuleVersion(0)
	public col_expr(_p?: number): Col_exprContext {
		if (_p === undefined) {
			_p = 0
		}

		let _parentctx: ParserRuleContext = this._ctx
		let _parentState: number = this.state
		let localctx: Col_exprContext = new Col_exprContext(
			this,
			this._ctx,
			_parentState,
		)
		let _prevctx: Col_exprContext = localctx
		let _startState: number = 2
		this.enterRecursionRule(
			localctx,
			2,
			SearchGrammarParser.RULE_col_expr,
			_p,
		)
		try {
			let _alt: number
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 28
				this._errHandler.sync(this)
				switch (this._input.LA(1)) {
					case 13:
						{
							this.state = 20
							this.match(SearchGrammarParser.LPAREN)
							this.state = 21
							this.col_expr(0)
							this.state = 22
							this.match(SearchGrammarParser.RPAREN)
						}
						break
					case 3:
						{
							this.state = 24
							this.match(SearchGrammarParser.NOT)
							this.state = 25
							this.col_expr(3)
						}
						break
					case 19:
						{
							this.state = 26
							this.match(SearchGrammarParser.STRING)
						}
						break
					case 18:
						{
							this.state = 27
							this.match(SearchGrammarParser.ID)
						}
						break
					default:
						throw new NoViableAltException(this)
				}
				this._ctx.stop = this._input.LT(-1)
				this.state = 44
				this._errHandler.sync(this)
				_alt = this._interp.adaptivePredict(this._input, 3, this._ctx)
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						if (this._parseListeners != null) {
							this.triggerExitRuleEvent()
						}
						_prevctx = localctx
						{
							this.state = 42
							this._errHandler.sync(this)
							switch (
								this._interp.adaptivePredict(
									this._input,
									2,
									this._ctx,
								)
							) {
								case 1:
									{
										localctx = new Col_exprContext(
											this,
											_parentctx,
											_parentState,
										)
										this.pushNewRecursionContext(
											localctx,
											_startState,
											SearchGrammarParser.RULE_col_expr,
										)
										this.state = 30
										if (!this.precpred(this._ctx, 5)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 5)',
											)
										}
										this.state = 31
										this.spaces()
										this.state = 32
										this.match(SearchGrammarParser.AND)
										this.state = 33
										this.spaces()
										this.state = 34
										this.col_expr(6)
									}
									break
								case 2:
									{
										localctx = new Col_exprContext(
											this,
											_parentctx,
											_parentState,
										)
										this.pushNewRecursionContext(
											localctx,
											_startState,
											SearchGrammarParser.RULE_col_expr,
										)
										this.state = 36
										if (!this.precpred(this._ctx, 4)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 4)',
											)
										}
										this.state = 37
										this.spaces()
										this.state = 38
										this.match(SearchGrammarParser.OR)
										this.state = 39
										this.spaces()
										this.state = 40
										this.col_expr(5)
									}
									break
							}
						}
					}
					this.state = 46
					this._errHandler.sync(this)
					_alt = this._interp.adaptivePredict(
						this._input,
						3,
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
				this.state = 65
				this._errHandler.sync(this)
				switch (
					this._interp.adaptivePredict(this._input, 4, this._ctx)
				) {
					case 1:
						{
							this.state = 48
							this.match(SearchGrammarParser.LPAREN)
							this.state = 49
							this.search_expr(0)
							this.state = 50
							this.match(SearchGrammarParser.RPAREN)
						}
						break
					case 2:
						{
							this.state = 52
							this.match(SearchGrammarParser.LPAREN)
							this.state = 53
							this.search_expr(0)
							this.state = 54
							this.match(SearchGrammarParser.RPAREN)
						}
						break
					case 3:
						{
							this.state = 56
							this.match(SearchGrammarParser.NOT)
							this.state = 57
							this.spaces()
							this.state = 58
							this.search_expr(3)
						}
						break
					case 4:
						{
							this.state = 60
							this.search_key()
							this.state = 61
							this.bin_op()
							this.state = 62
							this.col_expr(0)
						}
						break
					case 5:
						{
							this.state = 64
							this.col_expr(0)
						}
						break
				}
				this._ctx.stop = this._input.LT(-1)
				this.state = 85
				this._errHandler.sync(this)
				_alt = this._interp.adaptivePredict(this._input, 6, this._ctx)
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						if (this._parseListeners != null) {
							this.triggerExitRuleEvent()
						}
						_prevctx = localctx
						{
							this.state = 83
							this._errHandler.sync(this)
							switch (
								this._interp.adaptivePredict(
									this._input,
									5,
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
										this.state = 67
										if (!this.precpred(this._ctx, 6)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 6)',
											)
										}
										this.state = 68
										this.spaces()
										this.state = 69
										this.match(SearchGrammarParser.AND)
										this.state = 70
										this.spaces()
										this.state = 71
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
										this.state = 73
										if (!this.precpred(this._ctx, 5)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 5)',
											)
										}
										this.state = 74
										this.spaces()
										this.state = 75
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
										this.state = 77
										if (!this.precpred(this._ctx, 4)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 4)',
											)
										}
										this.state = 78
										this.spaces()
										this.state = 79
										this.match(SearchGrammarParser.OR)
										this.state = 80
										this.spaces()
										this.state = 81
										this.search_expr(5)
									}
									break
							}
						}
					}
					this.state = 87
					this._errHandler.sync(this)
					_alt = this._interp.adaptivePredict(
						this._input,
						6,
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
				this.state = 88
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
	public bin_op(): Bin_opContext {
		let localctx: Bin_opContext = new Bin_opContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 8, SearchGrammarParser.RULE_bin_op)
		let _la: number
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 90
				_la = this._input.LA(1)
				if (!((_la & ~0x1f) === 0 && ((1 << _la) & 132080) !== 0)) {
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
	public spaces(): SpacesContext {
		let localctx: SpacesContext = new SpacesContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 10, SearchGrammarParser.RULE_spaces)
		let _la: number
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 95
				this._errHandler.sync(this)
				_la = this._input.LA(1)
				while (_la === 20) {
					{
						{
							this.state = 92
							this.match(SearchGrammarParser.WS)
						}
					}
					this.state = 97
					this._errHandler.sync(this)
					_la = this._input.LA(1)
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
			case 1:
				return this.col_expr_sempred(
					localctx as Col_exprContext,
					predIndex,
				)
			case 2:
				return this.search_expr_sempred(
					localctx as Search_exprContext,
					predIndex,
				)
		}
		return true
	}
	private col_expr_sempred(
		localctx: Col_exprContext,
		predIndex: number,
	): boolean {
		switch (predIndex) {
			case 0:
				return this.precpred(this._ctx, 5)
			case 1:
				return this.precpred(this._ctx, 4)
		}
		return true
	}
	private search_expr_sempred(
		localctx: Search_exprContext,
		predIndex: number,
	): boolean {
		switch (predIndex) {
			case 2:
				return this.precpred(this._ctx, 6)
			case 3:
				return this.precpred(this._ctx, 5)
			case 4:
				return this.precpred(this._ctx, 4)
		}
		return true
	}

	public static readonly _serializedATN: number[] = [
		4, 1, 20, 99, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7,
		4, 2, 5, 7, 5, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 3, 0, 18, 8, 0, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 29, 8, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 43, 8, 1,
		10, 1, 12, 1, 46, 9, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2,
		1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 3, 2, 66, 8,
		2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1,
		2, 1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 84, 8, 2, 10, 2, 12, 2, 87, 9, 2, 1, 3,
		1, 3, 1, 4, 1, 4, 1, 5, 5, 5, 94, 8, 5, 10, 5, 12, 5, 97, 9, 5, 1, 5, 0,
		2, 2, 4, 6, 0, 2, 4, 6, 8, 10, 0, 1, 2, 0, 4, 9, 17, 17, 106, 0, 17, 1,
		0, 0, 0, 2, 28, 1, 0, 0, 0, 4, 65, 1, 0, 0, 0, 6, 88, 1, 0, 0, 0, 8, 90,
		1, 0, 0, 0, 10, 95, 1, 0, 0, 0, 12, 18, 5, 0, 0, 1, 13, 14, 3, 10, 5, 0,
		14, 15, 3, 4, 2, 0, 15, 16, 5, 0, 0, 1, 16, 18, 1, 0, 0, 0, 17, 12, 1,
		0, 0, 0, 17, 13, 1, 0, 0, 0, 18, 1, 1, 0, 0, 0, 19, 20, 6, 1, -1, 0, 20,
		21, 5, 13, 0, 0, 21, 22, 3, 2, 1, 0, 22, 23, 5, 14, 0, 0, 23, 29, 1, 0,
		0, 0, 24, 25, 5, 3, 0, 0, 25, 29, 3, 2, 1, 3, 26, 29, 5, 19, 0, 0, 27,
		29, 5, 18, 0, 0, 28, 19, 1, 0, 0, 0, 28, 24, 1, 0, 0, 0, 28, 26, 1, 0,
		0, 0, 28, 27, 1, 0, 0, 0, 29, 44, 1, 0, 0, 0, 30, 31, 10, 5, 0, 0, 31,
		32, 3, 10, 5, 0, 32, 33, 5, 1, 0, 0, 33, 34, 3, 10, 5, 0, 34, 35, 3, 2,
		1, 6, 35, 43, 1, 0, 0, 0, 36, 37, 10, 4, 0, 0, 37, 38, 3, 10, 5, 0, 38,
		39, 5, 2, 0, 0, 39, 40, 3, 10, 5, 0, 40, 41, 3, 2, 1, 5, 41, 43, 1, 0,
		0, 0, 42, 30, 1, 0, 0, 0, 42, 36, 1, 0, 0, 0, 43, 46, 1, 0, 0, 0, 44,
		42, 1, 0, 0, 0, 44, 45, 1, 0, 0, 0, 45, 3, 1, 0, 0, 0, 46, 44, 1, 0, 0,
		0, 47, 48, 6, 2, -1, 0, 48, 49, 5, 13, 0, 0, 49, 50, 3, 4, 2, 0, 50, 51,
		5, 14, 0, 0, 51, 66, 1, 0, 0, 0, 52, 53, 5, 13, 0, 0, 53, 54, 3, 4, 2,
		0, 54, 55, 5, 14, 0, 0, 55, 66, 1, 0, 0, 0, 56, 57, 5, 3, 0, 0, 57, 58,
		3, 10, 5, 0, 58, 59, 3, 4, 2, 3, 59, 66, 1, 0, 0, 0, 60, 61, 3, 6, 3, 0,
		61, 62, 3, 8, 4, 0, 62, 63, 3, 2, 1, 0, 63, 66, 1, 0, 0, 0, 64, 66, 3,
		2, 1, 0, 65, 47, 1, 0, 0, 0, 65, 52, 1, 0, 0, 0, 65, 56, 1, 0, 0, 0, 65,
		60, 1, 0, 0, 0, 65, 64, 1, 0, 0, 0, 66, 85, 1, 0, 0, 0, 67, 68, 10, 6,
		0, 0, 68, 69, 3, 10, 5, 0, 69, 70, 5, 1, 0, 0, 70, 71, 3, 10, 5, 0, 71,
		72, 3, 4, 2, 7, 72, 84, 1, 0, 0, 0, 73, 74, 10, 5, 0, 0, 74, 75, 3, 10,
		5, 0, 75, 76, 3, 4, 2, 6, 76, 84, 1, 0, 0, 0, 77, 78, 10, 4, 0, 0, 78,
		79, 3, 10, 5, 0, 79, 80, 5, 2, 0, 0, 80, 81, 3, 10, 5, 0, 81, 82, 3, 4,
		2, 5, 82, 84, 1, 0, 0, 0, 83, 67, 1, 0, 0, 0, 83, 73, 1, 0, 0, 0, 83,
		77, 1, 0, 0, 0, 84, 87, 1, 0, 0, 0, 85, 83, 1, 0, 0, 0, 85, 86, 1, 0, 0,
		0, 86, 5, 1, 0, 0, 0, 87, 85, 1, 0, 0, 0, 88, 89, 5, 18, 0, 0, 89, 7, 1,
		0, 0, 0, 90, 91, 7, 0, 0, 0, 91, 9, 1, 0, 0, 0, 92, 94, 5, 20, 0, 0, 93,
		92, 1, 0, 0, 0, 94, 97, 1, 0, 0, 0, 95, 93, 1, 0, 0, 0, 95, 96, 1, 0, 0,
		0, 96, 11, 1, 0, 0, 0, 97, 95, 1, 0, 0, 0, 8, 17, 28, 42, 44, 65, 83,
		85, 95,
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
	public spaces(): SpacesContext {
		return this.getTypedRuleContext(SpacesContext, 0) as SpacesContext
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
	public col_expr_list(): Col_exprContext[] {
		return this.getTypedRuleContexts(Col_exprContext) as Col_exprContext[]
	}
	public col_expr(i: number): Col_exprContext {
		return this.getTypedRuleContext(Col_exprContext, i) as Col_exprContext
	}
	public RPAREN(): TerminalNode {
		return this.getToken(SearchGrammarParser.RPAREN, 0)
	}
	public NOT(): TerminalNode {
		return this.getToken(SearchGrammarParser.NOT, 0)
	}
	public STRING(): TerminalNode {
		return this.getToken(SearchGrammarParser.STRING, 0)
	}
	public ID(): TerminalNode {
		return this.getToken(SearchGrammarParser.ID, 0)
	}
	public spaces_list(): SpacesContext[] {
		return this.getTypedRuleContexts(SpacesContext) as SpacesContext[]
	}
	public spaces(i: number): SpacesContext {
		return this.getTypedRuleContext(SpacesContext, i) as SpacesContext
	}
	public AND(): TerminalNode {
		return this.getToken(SearchGrammarParser.AND, 0)
	}
	public OR(): TerminalNode {
		return this.getToken(SearchGrammarParser.OR, 0)
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
	public NOT(): TerminalNode {
		return this.getToken(SearchGrammarParser.NOT, 0)
	}
	public spaces_list(): SpacesContext[] {
		return this.getTypedRuleContexts(SpacesContext) as SpacesContext[]
	}
	public spaces(i: number): SpacesContext {
		return this.getTypedRuleContext(SpacesContext, i) as SpacesContext
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
	public AND(): TerminalNode {
		return this.getToken(SearchGrammarParser.AND, 0)
	}
	public OR(): TerminalNode {
		return this.getToken(SearchGrammarParser.OR, 0)
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

export class SpacesContext extends ParserRuleContext {
	constructor(
		parser?: SearchGrammarParser,
		parent?: ParserRuleContext,
		invokingState?: number,
	) {
		super(parent, invokingState)
		this.parser = parser
	}
	public WS_list(): TerminalNode[] {
		return this.getTokens(SearchGrammarParser.WS)
	}
	public WS(i: number): TerminalNode {
		return this.getToken(SearchGrammarParser.WS, i)
	}
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_spaces
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterSpaces) {
			listener.enterSpaces(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitSpaces) {
			listener.exitSpaces(this)
		}
	}
}
