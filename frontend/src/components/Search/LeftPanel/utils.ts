import { FilterInfo } from './constants'

export const addKey = (filters: Map<string, FilterInfo>, key: string) => {
	if (!filters.has(key)) {
		filters.set(key, {
			saved: true,
			values: new Map(),
		})
	}
}

export const addValueToKey = (
	filters: Map<string, FilterInfo>,
	key: string,
	value: string,
	selected: boolean,
) => {
	if (!filters.has(key)) {
		filters.set(key, {
			saved: false,
			values: new Map(),
		})
	}

	// only overwrite if not defined or false
	if (!filters.get(key)!.values.get(value)) {
		filters.get(key)!.values.set(value, selected)
	}
}

export const addFilter = (text: string, key: string, value: string) => {
	return text
		.replace(
			new RegExp(`\\b${key}=([^()]+)`, 'g'),
			`${key}=\($1 OR "${value}")`,
		) // Add 'value' to 'key=value'
		.replace(new RegExp(`\\b${key}=\\(([^)]+)\\)`, 'g'), (_, values) => {
			const parts = values
				.split(/\s+or\s+/i)
				.map((v: string) => v.trim().replace(/^"|"$/g, '')) // remove existing quotes
			if (parts.includes(value))
				return `${key}=(${parts.map((v: string) => `"${v}"`).join(' OR ')})`
			return `${key}=(${[...parts, value].map((v) => `"${v}"`).join(' OR ')})`
		}) // Add 'value' to 'key=(values)'
}

export const removeFilter = (text: string, key: string, value: string) => {
	return text
		.replace(new RegExp(`${key}=\\(([^)]+)\\)`, 'g'), (_, inner) => {
			// Split values by OR and clean up quotes/spaces
			const values = inner
				.split(/\s+or\s+/i)
				.map((v: string) => v.trim().replace(/^"|"$/g, '')) // remove surrounding quotes
				.filter((v: string) => v !== value) // remove target value

			if (values.length === 0) return '' // remove the entire key if no values left

			return `${key}=(${values.map((v: string) => `"${v}"`).join(' OR ')})`
		}) // Also check for ungrouped: key=value or key="value"
		.replace(new RegExp(`${key}="?${value}"?(\\s|$)`, 'g'), '$1')
		.replace(/\(\s*\)/g, '') // clean up empty parens just in case
		.replace(/\s*OR\s*/g, ' OR ') // normalize spacing
		.replace(/\s+/g, ' ') // clean up stray spaces
		.trim()
}
