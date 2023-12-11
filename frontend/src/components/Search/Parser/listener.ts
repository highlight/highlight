import { ErrorNode } from 'antlr4'

import SearchGrammarListener from '@/components/Search/Parser/SearchGrammarListener'
import {
	Bin_opContext,
	Col_exprContext,
	Search_exprContext,
	Search_keyContext,
	Search_queryContext,
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

	enterSearch_query = (ctx: Search_queryContext) => {
		console.log('::: enterSearch_query', ctx.getText())
	}

	exitSearch_query = (ctx: Search_queryContext) => {
		console.log('::: exitSearch_query', ctx.getText())
	}

	enterSearch_expr = (ctx: Search_exprContext) => {
		console.log('::: enterSearch_expr', ctx.getText())

		if (!this.hasChildExpressions(ctx)) {
			// TODO: Figure out why the stop value is off by 1 :thinking:
			const stop = (ctx.stop ? ctx.stop.stop : ctx.start.stop) + 1
			const value = this.queryString.substring(ctx.start.start, stop)

			this.currentFilter = {
				type: 'filter',
				value,
				key: 'default',
				operator: '=',
				start: ctx.start.start,
				stop,
			}
		}
	}

	exitSearch_expr = (ctx: Search_exprContext) => {
		console.log('::: exitSearch_expr', ctx.getText())

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

	enterCol_expr = (ctx: Col_exprContext) => {
		console.log('::: enterCol_expr', ctx.getText())
	}

	exitCol_expr = (ctx: Col_exprContext) => {
		console.log('::: exitCol_expr', ctx.getText())
	}

	enterSearch_key = (ctx: Search_keyContext) => {
		console.log('::: enterSearch_key', ctx.getText())
		this.currentFilter.key = ctx.getText()
	}

	exitSearch_key = (ctx: Search_keyContext) => {
		console.log('::: exitSearch_key', ctx.getText())
	}

	enterBin_op = (ctx: Bin_opContext) => {
		console.log('::: enterBin_op', ctx.getText())
		this.currentFilter.operator = ctx.getText()
	}

	exitBin_op = (ctx: Bin_opContext) => {
		console.log('::: exitBin_op', ctx.getText())
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

	exitSpaces = (ctx: SpacesContext) => {
		console.log('::: exitSpaces', `"${ctx.getText()}"`)
	}

	visitErrorNode(node: ErrorNode): void {
		// console.log('::: visitErrorNode', node)
		this.currentFilter.error = {
			message: node.symbol.text,
			start: node.symbol.column,
			stop: node.symbol.column + node.symbol.text.length,
		}
	}
}
