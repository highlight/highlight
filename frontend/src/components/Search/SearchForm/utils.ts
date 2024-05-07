import {
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
	EXTENDED_TIME_PRESETS,
	presetStartDate,
} from '@highlight-run/ui/components'
import _ from 'lodash'

import SearchGrammarLexer from '@/components/Search/Parser/antlr/SearchGrammarLexer'
import { SearchExpression } from '@/components/Search/Parser/listener'
import { SearchToken } from '@/components/Search/utils'
import { useGetProjectQuery } from '@/graph/generated/hooks'
import { ProductType, RetentionPeriod } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'

export const DEFAULT_OPERATOR = '=' as const
export const BODY_KEY = 'message' as const

export const stringifySearchQuery = (params: SearchExpression[]) => {
	const querySegments: string[] = []
	let currentOffset = 0

	params.forEach(({ text, start }, index) => {
		const spaces = Math.max(start - currentOffset, index === 0 ? 0 : 1)
		currentOffset = start + text.length

		if (spaces > 0) {
			querySegments.push(' '.repeat(spaces))
		}

		querySegments.push(text)
	})

	return querySegments.join('').trim()
}

const NEED_QUOTE_REGEX = /["'` :=><]/

export const quoteQueryValue = (value: string | number) => {
	if (typeof value !== 'string') {
		return String(value)
	}

	const isQuotedString =
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'")) ||
		(value.startsWith('`') && value.endsWith('`'))
	if (isQuotedString) {
		return value
	}

	if (NEED_QUOTE_REGEX.test(value)) {
		return `"${value.replace(/"/g, '\\"')}"`
	}

	return value
}

const SEPARATOR_TOKENS = [SearchGrammarLexer.AND, SearchGrammarLexer.OR]

export type TokenGroup = {
	tokens: SearchToken[]
	start: number
	stop: number
	type: 'expression' | 'separator' | 'andOr'
	expression?: SearchExpression
	error?: string
}

const QUOTE_CHARS = ['"', "'", '`']

export const buildTokenGroups = (tokens: SearchToken[]) => {
	const tokenGroups: TokenGroup[] = []
	let currentGroup: TokenGroup | null = null
	let insideQuotes = false
	let insideParens = false

	const startNewGroup = (type: TokenGroup['type'], index: number) => {
		if (currentGroup) {
			tokenGroups.push(currentGroup)
		}

		insideParens = false
		insideQuotes = false

		currentGroup = {
			tokens: [],
			start: index,
			stop: index,
			type,
		}
	}

	tokens.forEach((token, index) => {
		if (token.type === SearchGrammarLexer.EOF) {
			return
		}

		// Check if we're inside quotes or parentheses
		if (QUOTE_CHARS.includes(token.text)) {
			insideQuotes = !insideQuotes
		} else if (token.text === '(') {
			insideParens = true
		} else if (token.text === ')') {
			insideParens = false
		}

		const tokenIsSeparator =
			SEPARATOR_TOKENS.includes(token.type) || token.text.trim() === ''

		// Start a new group if we encounter a space outside of quotes and parentheses
		if (tokenIsSeparator && !insideQuotes && !insideParens) {
			if (!currentGroup) {
				currentGroup = {
					tokens: [],
					start: token.start,
					stop: token.stop,
					type: 'separator',
				}
			} else {
				// Special handling of (NOT) EXISTS operators since we don't want to
				// break on a space character in that case.
				const nextThreeTokens = tokens.slice(index + 1, index + 4)
				const nextTokenIsExists =
					nextThreeTokens[0]?.type === SearchGrammarLexer.EXISTS
				const nextTokensIsNotExists =
					nextThreeTokens[0]?.type === SearchGrammarLexer.NOT &&
					nextThreeTokens[2]?.type === SearchGrammarLexer.EXISTS

				if (nextTokenIsExists || nextTokensIsNotExists) {
					currentGroup.tokens.push(token)
					currentGroup.stop = token.stop
					return
				}
			}

			// If we are not in a separator group, start a new one
			if (currentGroup.type !== 'separator') {
				startNewGroup('separator', token.start)
			}

			// Make AND and OR their own groups
			if (SEPARATOR_TOKENS.includes(token.type)) {
				startNewGroup('andOr', token.start)
			}

			currentGroup.tokens.push(token)
			currentGroup.stop = token.stop
		} else {
			if (!currentGroup) {
				currentGroup = {
					tokens: [],
					start: token.start,
					stop: token.stop,
					type: 'expression',
				}
			}

			if (currentGroup.type === 'separator') {
				startNewGroup('expression', token.start)
			}

			// Add the token to the current group
			currentGroup.tokens.push(token)
			currentGroup.stop = token.stop

			// If the token has an error message, assign an error property to the group
			if (token.errorMessage) {
				currentGroup.error = token.errorMessage
			}
		}
	})

	// Add the last group if it exists
	if (currentGroup) {
		tokenGroups.push(currentGroup)
	}

	return tokenGroups
}

export const useRetentionPresets = (productType: ProductType) => {
	const { projectId } = useProjectId()
	const { data } = useGetProjectQuery({
		variables: {
			id: projectId,
		},
	})

	let defaultPresets = DEFAULT_TIME_PRESETS
	let retentionPeriod = RetentionPeriod.ThirtyDays
	switch (productType) {
		case ProductType.Errors:
			retentionPeriod =
				data?.workspace?.errors_retention_period ??
				RetentionPeriod.SixMonths
			defaultPresets = EXTENDED_TIME_PRESETS
			break
		case ProductType.Sessions:
			retentionPeriod =
				data?.workspace?.retention_period ?? RetentionPeriod.SixMonths
			defaultPresets = EXTENDED_TIME_PRESETS
			break
	}

	let retentionPreset: DateRangePreset
	switch (retentionPeriod) {
		case RetentionPeriod.ThirtyDays:
			retentionPreset = {
				unit: 'days',
				quantity: 30,
			}
			break
		case RetentionPeriod.ThreeMonths:
			retentionPreset = {
				unit: 'months',
				quantity: 3,
			}
			break
		case RetentionPeriod.SixMonths:
			retentionPreset = {
				unit: 'months',
				quantity: 6,
			}
			break
		case RetentionPeriod.TwelveMonths:
			retentionPreset = {
				unit: 'months',
				quantity: 12,
			}
			break
		case RetentionPeriod.TwoYears:
			retentionPreset = {
				unit: 'years',
				quantity: 2,
			}
			break
		case RetentionPeriod.ThreeYears:
			retentionPreset = {
				unit: 'years',
				quantity: 3,
			}
			break
	}

	const presets = _.uniqWith(
		defaultPresets.concat([retentionPreset]),
		_.isEqual,
	)
	const minDate = presetStartDate(presets[presets.length - 1])

	return {
		presets,
		minDate,
	}
}
