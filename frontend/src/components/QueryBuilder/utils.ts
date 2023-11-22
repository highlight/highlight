import { deserializeRules } from '@/components/QueryBuilder/QueryBuilder'
import { SearchOption } from '@/components/Select/SearchSelect/SearchSelect'

export type SearchObject = {
	isAnd: boolean
	rules: string[][]
}

export const searchesAreEqual = (
	search: string,
	newSearch: string,
	timeRangeField: SearchOption,
) => {
	const { rules } = searchObjectFromString(search)
	const { rules: newRules } = searchObjectFromString(newSearch)

	if (rules.length !== newRules.length) {
		return false
	}

	return rules.every((rule) => {
		if (rule.field?.value === timeRangeField.value) {
			return true
		}

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
	}
}
