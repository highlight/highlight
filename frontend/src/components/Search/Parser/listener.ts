import {
	ErrorListener,
	ErrorNode,
	ParserRuleContext,
	RecognitionException,
	Recognizer,
	Token,
} from 'antlr4'

import SearchGrammarListener from '@/components/Search/Parser/SearchGrammarListener'
import {
	Bin_opContext,
	Search_exprContext,
	Search_keyContext,
	Search_queryContext,
} from '@/components/Search/Parser/SearchGrammarParser'

type Type = 'filter' | 'spaces'

export type Filter = {
	type: Type
	value: string
	key?: string
	operator?: string
	error?: {
		line: number
		column: number
		msg: string
		e: RecognitionException | undefined
	}
	start: number
	stop: number
}

export class SearchListener extends SearchGrammarListener {
	private currentFilter = {} as Filter

	constructor(public queryString: string, public filters: Filter[]) {
		super()

		this.queryString = queryString
		this.filters = filters
		this.tokens = []
	}

	// exitSearch_query = (_: Search_queryContext) => {
	// 	const lastFilter = this.filters[this.filters.length - 1]

	// 	// If the query ends with spaces (could be more than ont), add them as the
	// 	// last filter and trim them off the existing last filter.
	// 	// TODO: See if we can fix this in the grammar rather than here. See #7323
	// 	// for more details.
	// 	if (
	// 		lastFilter &&
	// 		lastFilter.type === 'filter' &&
	// 		lastFilter.value.endsWith(' ')
	// 	) {
	// 		const match = lastFilter.value.match(/(\s*)$/)
	// 		const trailingSpaces = match ? match[0] : ''

	// 		if (lastFilter) {
	// 			lastFilter.value = lastFilter.value.trimEnd()
	// 			lastFilter.stop = lastFilter.stop - trailingSpaces.length
	// 		}

	// 		this.filters.push({
	// 			type: 'spaces',
	// 			value: trailingSpaces,
	// 			start: lastFilter.stop,
	// 			stop: lastFilter.stop,
	// 		})
	// 	}
	// }

	enterSearch_expr = (ctx: Search_exprContext) => {
		if (!this.hasChildExpressions(ctx)) {
			const start = ctx.start.start

			// TODO: Figure out why we need to adjust the stop index by 1.
			const stop = (ctx.stop ? ctx.stop.stop : ctx.start.stop) + 1

			// Use start/stop to capture text becayse getText includes error text.
			const value = ctx.getText().slice(0, stop - start)

			this.currentFilter = {
				type: 'filter',
				value: ctx.getText(),
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
			const text = ctx.getText()

			if (text.length > 0) {
				this.filters.push({
					type: 'spaces',
					value: text,
					start: ctx.start.start,
					stop: ctx.start.start + text.length,
				})
			}
		}
	}

	visitErrorNode(node: ErrorNode): void {
		const error = (node as any).error as SearchError

		if (error) {
			this.currentFilter.error = error
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
