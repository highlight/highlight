import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
	DateRangePreset,
	EXTENDED_TIME_PRESETS,
	presetStartDate,
} from '@highlight-run/ui/components'
import _ from 'lodash'
import moment from 'moment'

import { ProductType, RetentionPeriod } from '@/graph/generated/schemas'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import { getRetentionDays } from '@/pages/Billing/utils/utils'
import { SearchExpression } from '../Parser/listener'

export const useRetentionPresets = (productType?: ProductType) => {
	const { currentWorkspace } = useApplicationContext()

	let retentionPeriod: RetentionPeriod | undefined =
		RetentionPeriod.ThirtyDays
	switch (productType) {
		case ProductType.Errors:
			retentionPeriod =
				currentWorkspace?.errors_retention_period ??
				RetentionPeriod.ThreeMonths
			break
		case ProductType.Sessions:
			retentionPeriod =
				currentWorkspace?.retention_period ??
				RetentionPeriod.ThreeMonths
			break
		case undefined:
			// If no product type specified, use the max retention period
			const sessionDays = getRetentionDays(
				currentWorkspace?.retention_period ??
					RetentionPeriod.ThreeMonths,
			)
			const errorDays = getRetentionDays(
				currentWorkspace?.errors_retention_period ??
					RetentionPeriod.ThreeMonths,
			)

			if (sessionDays > errorDays) {
				retentionPeriod = currentWorkspace?.retention_period
			} else {
				retentionPeriod = currentWorkspace?.errors_retention_period
			}
			retentionPeriod = retentionPeriod ?? RetentionPeriod.ThreeMonths
	}

	let retentionPreset: DateRangePreset
	switch (retentionPeriod) {
		case RetentionPeriod.SevenDays:
			retentionPreset = {
				unit: 'days',
				quantity: 7,
			}
			break
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

	// Add the retention preset as a selectable preset
	// Filter out any presets larger than the retention duration
	const presets = _.uniqWith(
		EXTENDED_TIME_PRESETS.concat([retentionPreset]),
		_.isEqual,
	).filter((p) => {
		return (
			moment.duration(p.quantity, p.unit) <=
			moment.duration(retentionPreset.quantity, retentionPreset.unit)
		)
	})

	const minDate = presetStartDate(presets[presets.length - 1])

	return {
		presets,
		minDate,
	}
}

export interface SearchEntry {
	query: string
	timestamp: number
	count: number
	title?: string
	queryParts: SearchExpression[]
}

const MAX_HISTORY_LENGTH = 10

function getRecentSearches(moduleName: string): SearchEntry[] {
	const key = `${moduleName}_searchHistory`
	const history: SearchEntry[] = JSON.parse(localStorage.getItem(key) || '[]')
	return history
		.sort((a, b) => b.timestamp - a.timestamp)
		.slice(0, MAX_HISTORY_LENGTH)
}
function saveSearchQuery(
	moduleName: string,
	searchQuery: string,
	queryParts: SearchExpression[],
): void {
	const key = `${moduleName}_searchHistory`
	let history: SearchEntry[] = JSON.parse(localStorage.getItem(key) || '[]')

	// Create a Set based on unique search queries
	const uniqueQueries = new Set(history.map((item) => item.query))

	// If the query already exists, update the timestamp and count
	if (uniqueQueries.has(searchQuery)) {
		history = history.map((item) =>
			item.query == searchQuery
				? { ...item, timestamp: Date.now(), count: item.count + 1 }
				: item,
		)
	} else {
		// Add the new query to the history if it doesn't exist
		history.push({
			query: searchQuery,
			timestamp: Date.now(),
			count: 1,
			queryParts: queryParts,
		})
		uniqueQueries.add(searchQuery) // Add to the Set as well
	}
	// Limit the history length to MAX_HISTORY_LENGTH
	if (history.length > MAX_HISTORY_LENGTH) {
		history = history.slice(-MAX_HISTORY_LENGTH) // Keep the most recent queries
	}

	// Save the updated history back to localStorage
	localStorage.setItem(key, JSON.stringify(history))
}

export const useSearchHistory = () => {
	const [recentSearches, setRecentSearches] = useState<SearchEntry[]>([])
	const [historyLoading, setHistoryLoading] = useState(true)
	const locaiton = useLocation()
	//currently we are storing the pathname as identifier. So it is project specific. if we want global search we can tweak the below path and achieve that.
	const pathName = locaiton?.pathname
	const search = location?.search

	useEffect(() => {
		setRecentSearches(getRecentSearches(pathName))
		setHistoryLoading(false)
	}, [pathName, search])

	const handleSearch = (query: string, queryParts: SearchExpression[]) => {
		const trimedQuery = queryParts.reduce((acc, part) => {
			acc = (acc ? `${acc} ` : acc) + part.text.trim()
			return acc.trim()
		}, '')
		if (trimedQuery !== '') {
			saveSearchQuery(pathName, trimedQuery, queryParts)
			setRecentSearches(getRecentSearches(pathName))
		}
	}

	return {
		recentSearches,
		handleSearch,
		historyLoading,
	}
}
