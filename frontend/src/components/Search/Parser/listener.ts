import { ErrorListener, RecognitionException, Recognizer, Token } from 'antlr4'

import SearchGrammarListener from '@/components/Search/Parser/antlr/SearchGrammarListener'
import {
	Body_search_exprContext,
	Search_exprContext,
} from '@/components/Search/Parser/antlr/SearchGrammarParser'

export type Expression = {
	start: number
	stop: number
	text: string
}

export class SearchListener extends SearchGrammarListener {
	constructor(public queryString: string, public expressions: Expression[]) {
		super()

		this.queryString = queryString
		this.expressions = expressions
	}

	exitKey_val_search_expr = (ctx: Search_exprContext) => {
		const start = ctx.start.start
		const stop = ctx.stop ? ctx.stop.stop : ctx.start.stop
		const text = this.queryString.substring(start, stop + 1)
		const filter = { start, stop, text }

		this.expressions.push(filter)
	}

	exitBody_search_expr = (ctx: Body_search_exprContext) => {
		const start = ctx.start.start
		const stop = ctx.stop ? ctx.stop.stop : ctx.start.stop
		const text = this.queryString.substring(start, stop + 1)
		const filter = { start, stop, text }

		this.expressions.push(filter)
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
