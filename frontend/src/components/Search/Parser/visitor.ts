import { ParserRuleContext, ParseTree } from 'antlr4'

import {
	Bin_opContext,
	Col_exprContext,
	Search_exprContext,
	Search_queryContext,
} from '@/components/Search/Parser/SearchGrammarParser'
import SearchGrammarVisitor from '@/components/Search/Parser/SearchGrammarVisitor'

// TODO: Store additional properties
type SearchPart = {
	value: string
	start?: number
	stop?: number
	index?: number
	error?: string
	type?: string
}

type Filter = {
	key: string
	operator: string
	type?: string
	value: string
	error?: string
	start?: number
	stop?: number
	waitingForClosingParen?: boolean
	waitingForClosingQuote?: boolean
}

export class SearchVisitor extends SearchGrammarVisitor<
	any[] | undefined | void
> {
	currentExpression: Filter = {} as Filter
	errors: string[] = []
	parts: SearchPart[] = []
	expressions: Filter[] = []
	ruleNames: string[] = []

	defaultResult() {
		return null
	}

	visitSearch_expr = (ctx: Search_exprContext) => {
		console.log('::: visitSearch_expr', ctx.getText())

		// Extract the key, operator, and value from the context
		const firstChild = ctx.getChild(0)

		if (Object.keys(this.currentExpression).length > 0) {
			this.finalizeExpression()
		}

		if (!(firstChild instanceof Search_exprContext)) {
			this.currentExpression = { value: ctx.getText() }
		}

		return this.visitChildren(ctx)
	}

	visitCol_expr = (ctx: Col_exprContext) => {
		console.log('::: visitCol_expr', ctx.getText())
		return this.visitChildren(ctx)
	}

	visitBin_op = (ctx: Bin_opContext) => {
		console.log('::: visitBin_op', ctx.getText())
		return this.visitChildren(ctx)
	}

	visitSearch_query = (ctx: Search_queryContext) => {
		console.log('::: visitSearch_query', ctx.getText())
		return this.visitChildren(ctx)
	}

	visitChildren(ctx: ParserRuleContext) {
		if (!ctx) {
			return
		}

		console.log('::: visitChildren', ctx.getText())
		// When there are no more children, finalize the current expression
		if (ctx.children && ctx.children.length === 0) {
			this.finalizeExpression()
		}

		if (ctx.children) {
			return ctx.children.map((child) => {
				if (child.children && child.children.length != 0) {
					return child.accept(this)
				} else {
					this.processChild(child)
				}
			})
		}
	}

	processParent(ctx: ParserRuleContext) {
		console.log('::: processParent', ctx.getText())
		ctx.accept(this)
	}

	processChild(ctx: ParseTree) {
		return ctx.getText()
	}

	finalizeExpression() {
		if (this.currentExpression) {
			this.expressions.push(this.currentExpression)
			this.currentExpression = {} as Filter
		}
	}
}
