import { ErrorListener, RecognitionException, Recognizer, Token } from 'antlr4'

import SearchGrammarListener from '@/components/Search/Parser/antlr/SearchGrammarListener'
import {
	Bin_opContext,
	Body_search_exprContext,
	Id_search_valueContext,
	Key_val_search_exprContext,
	Search_keyContext,
	Search_queryContext,
} from '@/components/Search/Parser/antlr/SearchGrammarParser'
import { BODY_KEY } from '@/components/Search/SearchForm/utils'

export type SearchExpression = {
	start: number
	stop: number
	text: string
	key: string
	operator: string
	value: string
	error?: {
		message: string
		start: number
		symbol: Token
	}
}

const DEFAULT_EXPRESSION = {
	key: BODY_KEY,
	operator: '=',
} as SearchExpression

export class SearchListener extends SearchGrammarListener {
	private currentExpression = { ...DEFAULT_EXPRESSION }

	constructor(
		private queryString: string,
		private expressions: SearchExpression[],
		private errors: SearchExpression['error'][],
	) {
		super()
	}

	enterKey_val_search_expr = (ctx: Key_val_search_exprContext) => {
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

	enterBin_op = (ctx: Bin_opContext) => {
		this.currentExpression.operator = ctx.getText()
	}

	enterId_search_value = (ctx: Id_search_valueContext) => {
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

	exitBody_search_expr = (_ctx: Body_search_exprContext) => {
		this.currentExpression.value = this.currentExpression.text
		this.expressions.push(this.currentExpression)
		this.currentExpression = { ...DEFAULT_EXPRESSION }
	}

	exitSearch_query = (ctx: Search_queryContext) => {
		const leadingWhitespace = this.queryString.match(/^ +/)
		const trailingWhitespace = this.queryString.match(/ +$/)

		if (leadingWhitespace) {
			this.expressions.unshift({
				...DEFAULT_EXPRESSION,
				text: leadingWhitespace ? leadingWhitespace[0] : '',
				start: 0,
				stop: leadingWhitespace?.length ?? 1,
			})
		}

		if (trailingWhitespace) {
			this.expressions.push({
				...DEFAULT_EXPRESSION,
				text: trailingWhitespace ? trailingWhitespace[0] : '',
				start: ctx.stop?.stop ?? this.queryString.length - 1,
				stop: ctx.start.start + this.queryString.length - 1,
			})
		}

		this.errors.forEach((error) => {
			const isEoFError = error!.symbol.type === -1
			const expression = isEoFError
				? this.expressions[this.expressions.length - 1]
				: this.expressions.find(
						({ start, stop }) =>
							error!.start >= start && error!.start <= stop,
				  )

			if (expression) {
				expression.error = error
			}
		})
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
	constructor(private errors: SearchExpression['error'][]) {
		super()
	}

	syntaxError(
		_recognizer: Recognizer<Token>,
		symbol: Token & { errorMessage?: string },
		_line: number,
		_column: number,
		msg: string,
		_e: RecognitionException | undefined,
	) {
		symbol.errorMessage = msg

		this.errors.push({
			start: symbol.start,
			message: msg,
			symbol: symbol,
		})
	}
}
