import { ErrorListener, RecognitionException, Recognizer, Token } from 'antlr4'

import SearchGrammarListener from '@/components/Search/Parser/antlr/SearchGrammarListener'
import {
	And_opContext,
	Bin_opContext,
	Body_search_exprContext,
	Exists_opContext,
	Exists_search_exprContext,
	Key_val_search_exprContext,
	Or_opContext,
	Search_keyContext,
	Search_valueContext,
} from '@/components/Search/Parser/antlr/SearchGrammarParser'
import { SearchOperator } from '@/components/Search/SearchForm/SearchForm'
import { BODY_KEY } from '@/components/Search/SearchForm/utils'

export type SearchExpression = {
	start: number
	stop: number
	text: string
	key: string
	operator: SearchOperator
	value: string
	error?: {
		message: string
		start: number
		symbol: Token
	}
}

export type AndOrExpression = {
	start: number
	stop: number
	text: string
}

const DEFAULT_EXPRESSION = {
	key: BODY_KEY,
	operator: '=',
} as SearchExpression

export class SearchListener extends SearchGrammarListener {
	private currentExpression = { ...DEFAULT_EXPRESSION }

	constructor(
		private queryString: string,
		private expressions: Array<SearchExpression | AndOrExpression>,
	) {
		super()
	}

	enterAnd_op = (ctx: And_opContext) => {
		const start = ctx.start.start
		const stop = ctx.stop ? ctx.stop.stop : ctx.start.stop
		const text = this.queryString.substring(start, stop + 1)
		this.expressions.push({ start, stop, text })
		this.currentExpression = { ...DEFAULT_EXPRESSION }
	}

	enterOr_op = (ctx: Or_opContext) => {
		const start = ctx.start.start
		const stop = ctx.stop ? ctx.stop.stop : ctx.start.stop
		const text = this.queryString.substring(start, stop + 1)
		this.expressions.push({ start, stop, text })
		this.currentExpression = { ...DEFAULT_EXPRESSION }
	}

	enterKey_val_search_expr = (ctx: Key_val_search_exprContext) => {
		const start = ctx.start.start
		const stop = ctx.stop ? ctx.stop.stop : ctx.start.stop
		const text = this.queryString.substring(start, stop + 1)
		this.currentExpression = { start, stop, text } as SearchExpression
	}

	enterExists_search_expr = (ctx: Exists_search_exprContext) => {
		const start = ctx.start.start
		const stop = ctx.stop ? ctx.stop.stop : ctx.start.stop
		const text = this.queryString.substring(start, stop + 1)
		this.currentExpression = { start, stop, text } as SearchExpression
	}

	enterBody_search_expr = (ctx: Body_search_exprContext) => {
		const start = ctx.start.start
		const stop = ctx.stop ? ctx.stop.stop : ctx.start.stop
		const text = this.queryString.substring(start, stop + 1)
		this.currentExpression = {
			...DEFAULT_EXPRESSION,
			start,
			stop,
			text,
		}
	}

	enterSearch_key = (ctx: Search_keyContext) => {
		this.currentExpression.key = ctx.getText()
	}

	enterExists_op = (ctx: Exists_opContext) => {
		this.currentExpression.operator = ctx.getText() as SearchOperator
		this.currentExpression.value = ''
	}

	enterBin_op = (ctx: Bin_opContext) => {
		this.currentExpression.operator = ctx.getText() as SearchOperator
	}

	enterSearch_value = (ctx: Search_valueContext) => {
		this.currentExpression.value = ctx.getText()
	}

	exitKey_val_search_expr = (_ctx: Key_val_search_exprContext) => {
		this.currentExpression.value = this.currentExpression.text.substring(
			this.currentExpression.key.length +
				this.currentExpression.operator.length,
		)
		this.expressions.push(this.currentExpression)
		this.currentExpression = { ...DEFAULT_EXPRESSION }
	}

	exitExists_search_expr = (_ctx: Exists_search_exprContext) => {
		this.expressions.push(this.currentExpression)
		this.currentExpression = { ...DEFAULT_EXPRESSION }
	}

	exitBody_search_expr = (_ctx: Body_search_exprContext) => {
		this.currentExpression.value = this.currentExpression.text
		this.expressions.push(this.currentExpression)
		this.currentExpression = { ...DEFAULT_EXPRESSION }
	}
}

export type SearchError = {
	line: number
	column: number
	msg: string
	e: RecognitionException | undefined
}

// Using an error listener rather than visitErrorNode because this seems to
// catch more errors.
export class SearchErrorListener extends ErrorListener<Token> {
	syntaxError(
		_recognizer: Recognizer<Token>,
		symbol: Token & { errorMessage?: string },
		_line: number,
		_column: number,
		msg: string,
		_e: RecognitionException | undefined,
	) {
		symbol.errorMessage = msg
	}
}
