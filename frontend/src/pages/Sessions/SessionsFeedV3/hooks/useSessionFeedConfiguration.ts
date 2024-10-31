import useLocalStorage from '@rehooks/local-storage'

import {
	SESSION_FEED_COUNT_FORMAT,
	SESSION_FEED_DATETIME_FORMAT,
	SESSION_FEED_RESULT_FORMAT,
	SESSION_FEED_SORT_ORDER,
	SESSION_HISTOGRAM_FORMAT,
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
	const [sessionHistogramFormat, setSessionHistogramFormat] =
		useLocalStorage<SESSION_HISTOGRAM_FORMAT>(
			`${LOCAL_STORAGE_KEY_PREFIX}HistogramFormat`,
			'With/Without Errors',
		)
	const [resultFormat, setResultFormat] =
		useLocalStorage<SESSION_FEED_RESULT_FORMAT>(
			`${LOCAL_STORAGE_KEY_PREFIX}ResultFormat`,
			'Count',
		)
	const [resultFormatConfigured, setResultFormatConfigured] =
		useLocalStorage<boolean>(
			`${LOCAL_STORAGE_KEY_PREFIX}ResultFormat-configured-v2`,
			false,
		)

	useEffect(() => {
		if (!resultFormatConfigured && sessionResultsVerbose) {
			setResultFormat('Count/Length/ActiveLength')
			setSessionHistogramFormat('Active/Inactive Time')
			setResultFormatConfigured(true)
		}
	}, [
		resultFormatConfigured,
		sessionResultsVerbose,
		setResultFormat,
		setSessionHistogramFormat,
		setResultFormatConfigured,
	])

	return {
		datetimeFormat,
		setDatetimeFormat,
		countFormat,
		setCountFormat,
		sortOrder,
		setSortOrder,
		sessionHistogramFormat,
		setSessionHistogramFormat,
		resultFormat,
		setResultFormat,
	}
}
