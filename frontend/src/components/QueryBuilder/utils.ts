import { deserializeRules } from '@/components/QueryBuilder/QueryBuilder'

export type SearchObject = {
	isAnd: boolean
	rules: string[][]
	startDate: Date
	endDate: Date
}

export const searchesAreEqual = (search: string, newSearch: string) => {
	const { rules } = searchObjectFromString(search)
	const { rules: newRules } = searchObjectFromString(newSearch)

	if (rules.length !== newRules.length) {
		return false
	}

	return rules.every((rule) => {
		const newRule = newRules.find(
			(r) => r.field?.value === rule.field?.value,
		)
		return JSON.stringify(rule) === JSON.stringify(newRule)
	})
}

export const searchObjectFromString = (search: string) => {
	const searchJSON: SearchObject = JSON.parse(search)

	return {
		isAnd: searchJSON.isAnd,
		rules: deserializeRules(searchJSON.rules),
		startDate: searchJSON.startDate,
		endDate: searchJSON.endDate,
	}
}
