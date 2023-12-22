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
	// adding these keys so we can swap the expressions in for SearchParam
	key: string
	operator: string
	value: string
}

const DEFAULT_EXPRESSION = {
	key: BODY_KEY,
	operator: '=',
} as SearchExpression

export class SearchListener extends SearchGrammarListener {
	private currentExpression = { ...DEFAULT_EXPRESSION }

	constructor(
		public queryString: string,
		public expressions: SearchExpression[],
	) {
		super()

		this.queryString = queryString
		this.expressions = expressions
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
		console.log('::: exitSearch_query', this.queryString, this.expressions)
		if (this.queryString.endsWith(' ')) {
			const trailingWhitespace = this.queryString.match(/ +$/)
			this.expressions.push({
				...DEFAULT_EXPRESSION,
				text: trailingWhitespace ? trailingWhitespace[0] : '',
				start: ctx.start.start,
				stop: ctx.start.start + this.queryString.length - 1,
			})
		}
	}
}

export type SearchError = {
	line: number
	column: number
	msg: string
	e: RecognitionException | undefined
}

export class SearchErrorListener extends ErrorListener<Token> {
	public errors: SearchError[] = []

	syntaxError(
		_: Recognizer<Token>,
		offendingSymbol: Token,
		line: number,
		column: number,
		msg: string,
		e: RecognitionException | undefined,
	) {
		// Assign error propreties to the offendingSymbol so we can access them in
		// the listener.
		;(offendingSymbol as any).error = { line, column, msg, e }
	}
}
