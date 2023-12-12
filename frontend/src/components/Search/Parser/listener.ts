import {
	ErrorListener,
	ErrorNode,
	RecognitionException,
	Recognizer,
	Token,
} from 'antlr4'

import SearchGrammarListener from '@/components/Search/Parser/SearchGrammarListener'
import {
	Bin_opContext,
	Search_exprContext,
	Search_keyContext,
	SpacesContext,
} from '@/components/Search/Parser/SearchGrammarParser'

type Type = 'filter' | 'spaces'

export type Filter = {
	type: Type
	value: string
	key?: string
	operator?: string
	error?: {
		message: string
		start: number
		stop: number
	}
	start: number
	stop: number
}

export class SearchListener extends SearchGrammarListener {
	private currentFilter = {} as Filter

	constructor(public queryString: string, public filters: any[]) {
		super()

		this.queryString = queryString
		this.filters = filters
	}

	enterSearch_expr = (ctx: Search_exprContext) => {
		if (!this.hasChildExpressions(ctx)) {
			const start = ctx.start.start
			// TODO: Figure out why we need to adjust the stop index by 1.
			const stop = (ctx.stop ? ctx.stop.stop : ctx.start.stop) + 1
			// Use start/stop to capture text becayse getText includes error text.
			const value = ctx.getText().slice(0, stop - start)

			this.currentFilter = {
				type: 'filter',
				value,
				key: 'default',
				operator: '=',
				start,
				stop,
			}
		}
	}

	exitSearch_expr = (ctx: Search_exprContext) => {
		if (!this.hasChildExpressions(ctx)) {
			this.filters.push(this.currentFilter)
			this.currentFilter = {} as Filter
		}
	}

	hasChildExpressions(ctx: Search_exprContext) {
		return (
			ctx.children &&
			ctx.children.some((child) => child instanceof Search_exprContext)
		)
	}

	enterSearch_key = (ctx: Search_keyContext) => {
		this.currentFilter.key = ctx.getText()
	}

	enterBin_op = (ctx: Bin_opContext) => {
		this.currentFilter.operator = ctx.getText()
	}

	enterSpaces = (ctx: SpacesContext) => {
		const parentContextType = ctx.parentCtx?.constructor.name

		// Don't add strings inside col_expr.
		if (parentContextType !== 'Col_exprContext') {
			this.filters.push({
				type: 'spaces',
				value: ctx.getText(),
			})
		}
	}

	visitErrorNode(node: ErrorNode): void {
		const error = (node as any).error as SearchError

		this.currentFilter.error = {
			message: error?.msg ?? node.symbol.text,
			start: node.symbol.column,
			stop: node.symbol.column + node.symbol.text.length,
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
