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
	public static readonly RULE_search_query = 0
	public static readonly RULE_top_col_expr = 1
	public static readonly RULE_col_expr = 2
	public static readonly RULE_search_expr = 3
	public static readonly RULE_search_key = 4
	public static readonly RULE_and_op = 5
	public static readonly RULE_implicit_and_op = 6
	public static readonly RULE_or_op = 7
	public static readonly RULE_negation_op = 8
	public static readonly RULE_bin_op = 9
	public static readonly RULE_search_value = 10
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
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		'search_query',
		'top_col_expr',
		'col_expr',
		'search_expr',
		'search_key',
		'and_op',
		'implicit_and_op',
		'or_op',
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
			this.state = 26
			this._errHandler.sync(this)
			switch (this._input.LA(1)) {
				case -1:
					this.enterOuterAlt(localctx, 1)
					{
						this.state = 22
						this.match(SearchGrammarParser.EOF)
					}
					break
				case 3:
				case 11:
				case 14:
				case 15:
				case 16:
					this.enterOuterAlt(localctx, 2)
					{
						this.state = 23
						this.search_expr(0)
						this.state = 24
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
	public top_col_expr(): Top_col_exprContext {
		let localctx: Top_col_exprContext = new Top_col_exprContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 2, SearchGrammarParser.RULE_top_col_expr)
		try {
			this.state = 36
			this._errHandler.sync(this)
			switch (this._input.LA(1)) {
				case 11:
					localctx = new Top_paren_col_exprContext(this, localctx)
					this.enterOuterAlt(localctx, 1)
					{
						this.state = 28
						this.match(SearchGrammarParser.LPAREN)
						this.state = 29
						this.col_expr(0)
						this.state = 30
						this.match(SearchGrammarParser.RPAREN)
					}
					break
				case 3:
					localctx = new Negated_top_col_exprContext(this, localctx)
					this.enterOuterAlt(localctx, 2)
					{
						this.state = 32
						this.negation_op()
						this.state = 33
						this.top_col_expr()
					}
					break
				case 14:
				case 15:
				case 16:
					localctx = new Top_col_search_valueContext(this, localctx)
					this.enterOuterAlt(localctx, 3)
					{
						this.state = 35
						this.search_value()
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
		let _startState: number = 4
		this.enterRecursionRule(
			localctx,
			4,
			SearchGrammarParser.RULE_col_expr,
			_p,
		)
		try {
			let _alt: number
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 47
				this._errHandler.sync(this)
				switch (this._input.LA(1)) {
					case 11:
						{
							localctx = new Col_paren_exprContext(this, localctx)
							this._ctx = localctx
							_prevctx = localctx

							this.state = 39
							this.match(SearchGrammarParser.LPAREN)
							this.state = 40
							this.col_expr(0)
							this.state = 41
							this.match(SearchGrammarParser.RPAREN)
						}
						break
					case 3:
						{
							localctx = new Negated_col_exprContext(
								this,
								localctx,
							)
							this._ctx = localctx
							_prevctx = localctx
							this.state = 43
							this.negation_op()
							this.state = 44
							this.col_expr(4)
						}
						break
					case 14:
					case 15:
					case 16:
						{
							localctx = new Col_search_valueContext(
								this,
								localctx,
							)
							this._ctx = localctx
							_prevctx = localctx
							this.state = 46
							this.search_value()
						}
						break
					default:
						throw new NoViableAltException(this)
				}
				this._ctx.stop = this._input.LT(-1)
				this.state = 58
				this._errHandler.sync(this)
				_alt = this._interp.adaptivePredict(this._input, 4, this._ctx)
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						if (this._parseListeners != null) {
							this.triggerExitRuleEvent()
						}
						_prevctx = localctx
						{
							this.state = 56
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
										localctx = new And_col_exprContext(
											this,
											new Col_exprContext(
												this,
												_parentctx,
												_parentState,
											),
										)
										this.pushNewRecursionContext(
											localctx,
											_startState,
											SearchGrammarParser.RULE_col_expr,
										)
										this.state = 49
										if (!this.precpred(this._ctx, 3)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 3)',
											)
										}
										this.state = 50
										this.and_op()
										this.state = 51
										this.col_expr(4)
									}
									break
								case 2:
									{
										localctx = new Or_col_exprContext(
											this,
											new Col_exprContext(
												this,
												_parentctx,
												_parentState,
											),
										)
										this.pushNewRecursionContext(
											localctx,
											_startState,
											SearchGrammarParser.RULE_col_expr,
										)
										this.state = 53
										if (!this.precpred(this._ctx, 2)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 2)',
											)
										}
										this.state = 54
										this.match(SearchGrammarParser.OR)
										this.state = 55
										this.col_expr(3)
									}
									break
							}
						}
					}
					this.state = 60
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
		let _startState: number = 6
		this.enterRecursionRule(
			localctx,
			6,
			SearchGrammarParser.RULE_search_expr,
			_p,
		)
		try {
			let _alt: number
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 74
				this._errHandler.sync(this)
				switch (
					this._interp.adaptivePredict(this._input, 5, this._ctx)
				) {
					case 1:
						{
							localctx = new Paren_search_exprContext(
								this,
								localctx,
							)
							this._ctx = localctx
							_prevctx = localctx

							this.state = 62
							this.match(SearchGrammarParser.LPAREN)
							this.state = 63
							this.search_expr(0)
							this.state = 64
							this.match(SearchGrammarParser.RPAREN)
						}
						break
					case 2:
						{
							localctx = new Negated_search_exprContext(
								this,
								localctx,
							)
							this._ctx = localctx
							_prevctx = localctx
							this.state = 66
							this.negation_op()
							this.state = 67
							this.search_expr(6)
						}
						break
					case 3:
						{
							localctx = new Key_val_search_exprContext(
								this,
								localctx,
							)
							this._ctx = localctx
							_prevctx = localctx
							this.state = 69
							this.search_key()
							this.state = 70
							this.bin_op()
							this.state = 71
							this.top_col_expr()
						}
						break
					case 4:
						{
							localctx = new Body_search_exprContext(
								this,
								localctx,
							)
							this._ctx = localctx
							_prevctx = localctx
							this.state = 73
							this.top_col_expr()
						}
						break
				}
				this._ctx.stop = this._input.LT(-1)
				this.state = 90
				this._errHandler.sync(this)
				_alt = this._interp.adaptivePredict(this._input, 7, this._ctx)
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						if (this._parseListeners != null) {
							this.triggerExitRuleEvent()
						}
						_prevctx = localctx
						{
							this.state = 88
							this._errHandler.sync(this)
							switch (
								this._interp.adaptivePredict(
									this._input,
									6,
									this._ctx,
								)
							) {
								case 1:
									{
										localctx = new And_search_exprContext(
											this,
											new Search_exprContext(
												this,
												_parentctx,
												_parentState,
											),
										)
										this.pushNewRecursionContext(
											localctx,
											_startState,
											SearchGrammarParser.RULE_search_expr,
										)
										this.state = 76
										if (!this.precpred(this._ctx, 5)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 5)',
											)
										}
										this.state = 77
										this.and_op()
										this.state = 78
										this.search_expr(6)
									}
									break
								case 2:
									{
										localctx = new Or_search_exprContext(
											this,
											new Search_exprContext(
												this,
												_parentctx,
												_parentState,
											),
										)
										this.pushNewRecursionContext(
											localctx,
											_startState,
											SearchGrammarParser.RULE_search_expr,
										)
										this.state = 80
										if (!this.precpred(this._ctx, 4)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 4)',
											)
										}
										this.state = 81
										this.or_op()
										this.state = 82
										this.search_expr(5)
									}
									break
								case 3:
									{
										localctx =
											new Implicit_and_search_exprContext(
												this,
												new Search_exprContext(
													this,
													_parentctx,
													_parentState,
												),
											)
										this.pushNewRecursionContext(
											localctx,
											_startState,
											SearchGrammarParser.RULE_search_expr,
										)
										this.state = 84
										if (!this.precpred(this._ctx, 3)) {
											throw this.createFailedPredicateException(
												'this.precpred(this._ctx, 3)',
											)
										}
										this.state = 85
										this.implicit_and_op()
										this.state = 86
										this.search_expr(4)
									}
									break
							}
						}
					}
					this.state = 92
					this._errHandler.sync(this)
					_alt = this._interp.adaptivePredict(
						this._input,
						7,
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
		this.enterRule(localctx, 8, SearchGrammarParser.RULE_search_key)
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 93
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
	public and_op(): And_opContext {
		let localctx: And_opContext = new And_opContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 10, SearchGrammarParser.RULE_and_op)
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 95
				this.match(SearchGrammarParser.AND)
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
	public implicit_and_op(): Implicit_and_opContext {
		let localctx: Implicit_and_opContext = new Implicit_and_opContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 12, SearchGrammarParser.RULE_implicit_and_op)
		try {
			this.enterOuterAlt(localctx, 1)
			// tslint:disable-next-line:no-empty
			{
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
	public or_op(): Or_opContext {
		let localctx: Or_opContext = new Or_opContext(
			this,
			this._ctx,
			this.state,
		)
		this.enterRule(localctx, 14, SearchGrammarParser.RULE_or_op)
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 99
				this.match(SearchGrammarParser.OR)
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
		this.enterRule(localctx, 16, SearchGrammarParser.RULE_negation_op)
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 101
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
		this.enterRule(localctx, 18, SearchGrammarParser.RULE_bin_op)
		let _la: number
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 103
				_la = this._input.LA(1)
				if (!((_la & ~0x1f) === 0 && ((1 << _la) & 10224) !== 0)) {
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
		this.enterRule(localctx, 20, SearchGrammarParser.RULE_search_value)
		let _la: number
		try {
			this.enterOuterAlt(localctx, 1)
			{
				this.state = 105
				_la = this._input.LA(1)
				if (!((_la & ~0x1f) === 0 && ((1 << _la) & 114688) !== 0)) {
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
				return this.col_expr_sempred(
					localctx as Col_exprContext,
					predIndex,
				)
			case 3:
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
				return this.precpred(this._ctx, 3)
			case 1:
				return this.precpred(this._ctx, 2)
		}
		return true
	}
	private search_expr_sempred(
		localctx: Search_exprContext,
		predIndex: number,
	): boolean {
		switch (predIndex) {
			case 2:
				return this.precpred(this._ctx, 5)
			case 3:
				return this.precpred(this._ctx, 4)
			case 4:
				return this.precpred(this._ctx, 3)
		}
		return true
	}

	public static readonly _serializedATN: number[] = [
		4, 1, 18, 108, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7,
		4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2, 10, 7,
		10, 1, 0, 1, 0, 1, 0, 1, 0, 3, 0, 27, 8, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 1, 3, 1, 37, 8, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2,
		1, 2, 1, 2, 1, 2, 3, 2, 48, 8, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1,
		2, 5, 2, 57, 8, 2, 10, 2, 12, 2, 60, 9, 2, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3,
		1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 3, 3, 75, 8, 3, 1, 3, 1,
		3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 5, 3, 89,
		8, 3, 10, 3, 12, 3, 92, 9, 3, 1, 4, 1, 4, 1, 5, 1, 5, 1, 6, 1, 6, 1, 7,
		1, 7, 1, 8, 1, 8, 1, 9, 1, 9, 1, 10, 1, 10, 1, 10, 0, 2, 4, 6, 11, 0, 2,
		4, 6, 8, 10, 12, 14, 16, 18, 20, 0, 2, 2, 0, 4, 10, 13, 13, 1, 0, 14,
		16, 109, 0, 26, 1, 0, 0, 0, 2, 36, 1, 0, 0, 0, 4, 47, 1, 0, 0, 0, 6, 74,
		1, 0, 0, 0, 8, 93, 1, 0, 0, 0, 10, 95, 1, 0, 0, 0, 12, 97, 1, 0, 0, 0,
		14, 99, 1, 0, 0, 0, 16, 101, 1, 0, 0, 0, 18, 103, 1, 0, 0, 0, 20, 105,
		1, 0, 0, 0, 22, 27, 5, 0, 0, 1, 23, 24, 3, 6, 3, 0, 24, 25, 5, 0, 0, 1,
		25, 27, 1, 0, 0, 0, 26, 22, 1, 0, 0, 0, 26, 23, 1, 0, 0, 0, 27, 1, 1, 0,
		0, 0, 28, 29, 5, 11, 0, 0, 29, 30, 3, 4, 2, 0, 30, 31, 5, 12, 0, 0, 31,
		37, 1, 0, 0, 0, 32, 33, 3, 16, 8, 0, 33, 34, 3, 2, 1, 0, 34, 37, 1, 0,
		0, 0, 35, 37, 3, 20, 10, 0, 36, 28, 1, 0, 0, 0, 36, 32, 1, 0, 0, 0, 36,
		35, 1, 0, 0, 0, 37, 3, 1, 0, 0, 0, 38, 39, 6, 2, -1, 0, 39, 40, 5, 11,
		0, 0, 40, 41, 3, 4, 2, 0, 41, 42, 5, 12, 0, 0, 42, 48, 1, 0, 0, 0, 43,
		44, 3, 16, 8, 0, 44, 45, 3, 4, 2, 4, 45, 48, 1, 0, 0, 0, 46, 48, 3, 20,
		10, 0, 47, 38, 1, 0, 0, 0, 47, 43, 1, 0, 0, 0, 47, 46, 1, 0, 0, 0, 48,
		58, 1, 0, 0, 0, 49, 50, 10, 3, 0, 0, 50, 51, 3, 10, 5, 0, 51, 52, 3, 4,
		2, 4, 52, 57, 1, 0, 0, 0, 53, 54, 10, 2, 0, 0, 54, 55, 5, 2, 0, 0, 55,
		57, 3, 4, 2, 3, 56, 49, 1, 0, 0, 0, 56, 53, 1, 0, 0, 0, 57, 60, 1, 0, 0,
		0, 58, 56, 1, 0, 0, 0, 58, 59, 1, 0, 0, 0, 59, 5, 1, 0, 0, 0, 60, 58, 1,
		0, 0, 0, 61, 62, 6, 3, -1, 0, 62, 63, 5, 11, 0, 0, 63, 64, 3, 6, 3, 0,
		64, 65, 5, 12, 0, 0, 65, 75, 1, 0, 0, 0, 66, 67, 3, 16, 8, 0, 67, 68, 3,
		6, 3, 6, 68, 75, 1, 0, 0, 0, 69, 70, 3, 8, 4, 0, 70, 71, 3, 18, 9, 0,
		71, 72, 3, 2, 1, 0, 72, 75, 1, 0, 0, 0, 73, 75, 3, 2, 1, 0, 74, 61, 1,
		0, 0, 0, 74, 66, 1, 0, 0, 0, 74, 69, 1, 0, 0, 0, 74, 73, 1, 0, 0, 0, 75,
		90, 1, 0, 0, 0, 76, 77, 10, 5, 0, 0, 77, 78, 3, 10, 5, 0, 78, 79, 3, 6,
		3, 6, 79, 89, 1, 0, 0, 0, 80, 81, 10, 4, 0, 0, 81, 82, 3, 14, 7, 0, 82,
		83, 3, 6, 3, 5, 83, 89, 1, 0, 0, 0, 84, 85, 10, 3, 0, 0, 85, 86, 3, 12,
		6, 0, 86, 87, 3, 6, 3, 4, 87, 89, 1, 0, 0, 0, 88, 76, 1, 0, 0, 0, 88,
		80, 1, 0, 0, 0, 88, 84, 1, 0, 0, 0, 89, 92, 1, 0, 0, 0, 90, 88, 1, 0, 0,
		0, 90, 91, 1, 0, 0, 0, 91, 7, 1, 0, 0, 0, 92, 90, 1, 0, 0, 0, 93, 94, 5,
		14, 0, 0, 94, 9, 1, 0, 0, 0, 95, 96, 5, 1, 0, 0, 96, 11, 1, 0, 0, 0, 97,
		98, 1, 0, 0, 0, 98, 13, 1, 0, 0, 0, 99, 100, 5, 2, 0, 0, 100, 15, 1, 0,
		0, 0, 101, 102, 5, 3, 0, 0, 102, 17, 1, 0, 0, 0, 103, 104, 7, 0, 0, 0,
		104, 19, 1, 0, 0, 0, 105, 106, 7, 1, 0, 0, 106, 21, 1, 0, 0, 0, 8, 26,
		36, 47, 56, 58, 74, 88, 90,
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

export class Top_col_exprContext extends ParserRuleContext {
	constructor(
		parser?: SearchGrammarParser,
		parent?: ParserRuleContext,
		invokingState?: number,
	) {
		super(parent, invokingState)
		this.parser = parser
	}
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_top_col_expr
	}
	public copyFrom(ctx: Top_col_exprContext): void {
		super.copyFrom(ctx)
	}
}
export class Negated_top_col_exprContext extends Top_col_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Top_col_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
	}
	public negation_op(): Negation_opContext {
		return this.getTypedRuleContext(
			Negation_opContext,
			0,
		) as Negation_opContext
	}
	public top_col_expr(): Top_col_exprContext {
		return this.getTypedRuleContext(
			Top_col_exprContext,
			0,
		) as Top_col_exprContext
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterNegated_top_col_expr) {
			listener.enterNegated_top_col_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitNegated_top_col_expr) {
			listener.exitNegated_top_col_expr(this)
		}
	}
}
export class Top_paren_col_exprContext extends Top_col_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Top_col_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
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
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterTop_paren_col_expr) {
			listener.enterTop_paren_col_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitTop_paren_col_expr) {
			listener.exitTop_paren_col_expr(this)
		}
	}
}
export class Top_col_search_valueContext extends Top_col_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Top_col_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
	}
	public search_value(): Search_valueContext {
		return this.getTypedRuleContext(
			Search_valueContext,
			0,
		) as Search_valueContext
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterTop_col_search_value) {
			listener.enterTop_col_search_value(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitTop_col_search_value) {
			listener.exitTop_col_search_value(this)
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
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_col_expr
	}
	public copyFrom(ctx: Col_exprContext): void {
		super.copyFrom(ctx)
	}
}
export class Or_col_exprContext extends Col_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Col_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
	}
	public col_expr_list(): Col_exprContext[] {
		return this.getTypedRuleContexts(Col_exprContext) as Col_exprContext[]
	}
	public col_expr(i: number): Col_exprContext {
		return this.getTypedRuleContext(Col_exprContext, i) as Col_exprContext
	}
	public OR(): TerminalNode {
		return this.getToken(SearchGrammarParser.OR, 0)
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterOr_col_expr) {
			listener.enterOr_col_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitOr_col_expr) {
			listener.exitOr_col_expr(this)
		}
	}
}
export class Col_paren_exprContext extends Col_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Col_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
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
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterCol_paren_expr) {
			listener.enterCol_paren_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitCol_paren_expr) {
			listener.exitCol_paren_expr(this)
		}
	}
}
export class And_col_exprContext extends Col_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Col_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
	}
	public col_expr_list(): Col_exprContext[] {
		return this.getTypedRuleContexts(Col_exprContext) as Col_exprContext[]
	}
	public col_expr(i: number): Col_exprContext {
		return this.getTypedRuleContext(Col_exprContext, i) as Col_exprContext
	}
	public and_op(): And_opContext {
		return this.getTypedRuleContext(And_opContext, 0) as And_opContext
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterAnd_col_expr) {
			listener.enterAnd_col_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitAnd_col_expr) {
			listener.exitAnd_col_expr(this)
		}
	}
}
export class Negated_col_exprContext extends Col_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Col_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
	}
	public negation_op(): Negation_opContext {
		return this.getTypedRuleContext(
			Negation_opContext,
			0,
		) as Negation_opContext
	}
	public col_expr(): Col_exprContext {
		return this.getTypedRuleContext(Col_exprContext, 0) as Col_exprContext
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterNegated_col_expr) {
			listener.enterNegated_col_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitNegated_col_expr) {
			listener.exitNegated_col_expr(this)
		}
	}
}
export class Col_search_valueContext extends Col_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Col_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
	}
	public search_value(): Search_valueContext {
		return this.getTypedRuleContext(
			Search_valueContext,
			0,
		) as Search_valueContext
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterCol_search_value) {
			listener.enterCol_search_value(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitCol_search_value) {
			listener.exitCol_search_value(this)
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
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_search_expr
	}
	public copyFrom(ctx: Search_exprContext): void {
		super.copyFrom(ctx)
	}
}
export class Negated_search_exprContext extends Search_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Search_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
	}
	public negation_op(): Negation_opContext {
		return this.getTypedRuleContext(
			Negation_opContext,
			0,
		) as Negation_opContext
	}
	public search_expr(): Search_exprContext {
		return this.getTypedRuleContext(
			Search_exprContext,
			0,
		) as Search_exprContext
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterNegated_search_expr) {
			listener.enterNegated_search_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitNegated_search_expr) {
			listener.exitNegated_search_expr(this)
		}
	}
}
export class Body_search_exprContext extends Search_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Search_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
	}
	public top_col_expr(): Top_col_exprContext {
		return this.getTypedRuleContext(
			Top_col_exprContext,
			0,
		) as Top_col_exprContext
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterBody_search_expr) {
			listener.enterBody_search_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitBody_search_expr) {
			listener.exitBody_search_expr(this)
		}
	}
}
export class And_search_exprContext extends Search_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Search_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
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
	public and_op(): And_opContext {
		return this.getTypedRuleContext(And_opContext, 0) as And_opContext
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterAnd_search_expr) {
			listener.enterAnd_search_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitAnd_search_expr) {
			listener.exitAnd_search_expr(this)
		}
	}
}
export class Or_search_exprContext extends Search_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Search_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
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
	public or_op(): Or_opContext {
		return this.getTypedRuleContext(Or_opContext, 0) as Or_opContext
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterOr_search_expr) {
			listener.enterOr_search_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitOr_search_expr) {
			listener.exitOr_search_expr(this)
		}
	}
}
export class Implicit_and_search_exprContext extends Search_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Search_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
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
	public implicit_and_op(): Implicit_and_opContext {
		return this.getTypedRuleContext(
			Implicit_and_opContext,
			0,
		) as Implicit_and_opContext
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterImplicit_and_search_expr) {
			listener.enterImplicit_and_search_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitImplicit_and_search_expr) {
			listener.exitImplicit_and_search_expr(this)
		}
	}
}
export class Key_val_search_exprContext extends Search_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Search_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
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
	public top_col_expr(): Top_col_exprContext {
		return this.getTypedRuleContext(
			Top_col_exprContext,
			0,
		) as Top_col_exprContext
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterKey_val_search_expr) {
			listener.enterKey_val_search_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitKey_val_search_expr) {
			listener.exitKey_val_search_expr(this)
		}
	}
}
export class Paren_search_exprContext extends Search_exprContext {
	constructor(parser: SearchGrammarParser, ctx: Search_exprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState)
		super.copyFrom(ctx)
	}
	public LPAREN(): TerminalNode {
		return this.getToken(SearchGrammarParser.LPAREN, 0)
	}
	public search_expr(): Search_exprContext {
		return this.getTypedRuleContext(
			Search_exprContext,
			0,
		) as Search_exprContext
	}
	public RPAREN(): TerminalNode {
		return this.getToken(SearchGrammarParser.RPAREN, 0)
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterParen_search_expr) {
			listener.enterParen_search_expr(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitParen_search_expr) {
			listener.exitParen_search_expr(this)
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

export class And_opContext extends ParserRuleContext {
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
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_and_op
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterAnd_op) {
			listener.enterAnd_op(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitAnd_op) {
			listener.exitAnd_op(this)
		}
	}
}

export class Implicit_and_opContext extends ParserRuleContext {
	constructor(
		parser?: SearchGrammarParser,
		parent?: ParserRuleContext,
		invokingState?: number,
	) {
		super(parent, invokingState)
		this.parser = parser
	}
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_implicit_and_op
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterImplicit_and_op) {
			listener.enterImplicit_and_op(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitImplicit_and_op) {
			listener.exitImplicit_and_op(this)
		}
	}
}

export class Or_opContext extends ParserRuleContext {
	constructor(
		parser?: SearchGrammarParser,
		parent?: ParserRuleContext,
		invokingState?: number,
	) {
		super(parent, invokingState)
		this.parser = parser
	}
	public OR(): TerminalNode {
		return this.getToken(SearchGrammarParser.OR, 0)
	}
	public get ruleIndex(): number {
		return SearchGrammarParser.RULE_or_op
	}
	public enterRule(listener: SearchGrammarListener): void {
		if (listener.enterOr_op) {
			listener.enterOr_op(this)
		}
	}
	public exitRule(listener: SearchGrammarListener): void {
		if (listener.exitOr_op) {
			listener.exitOr_op(this)
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
	public BANG(): TerminalNode {
		return this.getToken(SearchGrammarParser.BANG, 0)
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
	public STRING(): TerminalNode {
		return this.getToken(SearchGrammarParser.STRING, 0)
	}
	public ID(): TerminalNode {
		return this.getToken(SearchGrammarParser.ID, 0)
	}
	public VALUE(): TerminalNode {
		return this.getToken(SearchGrammarParser.VALUE, 0)
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
