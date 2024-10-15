import useLocalStorage from '@rehooks/local-storage'

import {
	SESSION_FEED_COUNT_FORMAT,
	SESSION_FEED_DATETIME_FORMAT,
	SESSION_FEED_RESULT_FORMAT,
	SESSION_FEED_SORT_ORDER,
} from '@/pages/Sessions/SessionsFeedV3/context/SessionFeedConfigurationContext'
import useFeatureFlag, { Feature } from '@hooks/useFeatureFlag/useFeatureFlag'
import { useEffect } from 'react'

const LOCAL_STORAGE_KEY_PREFIX = 'highlightSessionFeedConfiguration'

export const useSessionFeedConfiguration = () => {
	const sessionResultsVerbose = useFeatureFlag(Feature.SessionResultsVerbose)
	const [datetimeFormat, setDatetimeFormat] =
		useLocalStorage<SESSION_FEED_DATETIME_FORMAT>(
			`${LOCAL_STORAGE_KEY_PREFIX}DatetimeFormatV2`,
			'Smart',
		)
	const [countFormat, setCountFormat] =
		useLocalStorage<SESSION_FEED_COUNT_FORMAT>(
			`${LOCAL_STORAGE_KEY_PREFIX}CountFormat`,
			'Short',
		)
	const [sortOrder, setSortOrder] = useLocalStorage<SESSION_FEED_SORT_ORDER>(
		`${LOCAL_STORAGE_KEY_PREFIX}SortOrder`,
		'Descending',
	)
	const [resultFormat, setResultFormat] =
		useLocalStorage<SESSION_FEED_RESULT_FORMAT>(
			`${LOCAL_STORAGE_KEY_PREFIX}ResultFormat`,
			'Count',
		)
	const [resultFormatConfigured, setResultFormatConfigured] =
		useLocalStorage<boolean>(
			`${LOCAL_STORAGE_KEY_PREFIX}ResultFormat-configured`,
			false,
		)

	useEffect(() => {
		if (!resultFormatConfigured && sessionResultsVerbose) {
			setResultFormat('Count/Length/ActiveLength')
			setResultFormatConfigured(true)
		}
	}, [
		resultFormatConfigured,
		sessionResultsVerbose,
		setResultFormat,
		setResultFormatConfigured,
	])

	return {
		datetimeFormat,
		setDatetimeFormat,
		countFormat,
		setCountFormat,
		sortOrder,
		setSortOrder,
		resultFormat,
		setResultFormat,
	}
}
