import { formatNumber } from '@util/numbers'
import { H } from 'highlight.run'
import moment from 'moment'

import {
	SESSION_FEED_COUNT_FORMAT,
	SESSION_FEED_DATETIME_FORMAT,
	SESSION_FEED_RESULT_FORMAT,
	SESSION_FEED_SORT_ORDER,
} from '../context/SessionFeedConfigurationContext'

export const formatDatetime = (
	datetime: string,
	format: SESSION_FEED_DATETIME_FORMAT,
) => {
	const dt = moment(datetime)
	switch (format) {
		case 'Smart':
			if (moment().year() !== dt.year()) {
				return dt.format('M/D/YY')
			} else if (moment().month() !== dt.month()) {
				return dt.format('M/D HH:mm')
			} else if (moment().date() !== dt.date()) {
				return dt.format('MMM D h:mm A')
			} else {
				return dt.format('h:mm A')
			}
		case 'Relative':
			return dt.fromNow()
		case 'Date Only':
			return dt.format('M/D/YY')
		case 'Date and Time':
			return dt.format('M/D/YY h:mm A')
		case 'Date and Time with Milliseconds':
			return dt.format('M/D/YY h:mm:s A')
		case 'Unix':
			return dt.format('X')
		case 'Unix With Milliseconds':
			return dt.format('x')
		case 'ISO':
			return dt.toISOString()
		default:
			const error = new Error(
				`Unsupported date format used in formateDatetime: ${format}`,
			)
			H.consumeError(error)
			return datetime
	}
}

export const formatCount = (
	count: number,
	format: SESSION_FEED_COUNT_FORMAT,
) => {
	switch (format) {
		case 'Full':
			return count.toLocaleString()
		case 'Short':
			return formatNumber(count)
		default:
			const error = new Error(
				`Unsupported count format used in formateCount: ${format}`,
			)
			H.consumeError(error)
			return count
	}
}

export const getSortOrderDisplayName = (sortOrder: SESSION_FEED_SORT_ORDER) => {
	switch (sortOrder) {
		case 'Ascending':
			return 'Ascending (Oldest first)'
		case 'Descending':
		default:
			return 'Descending (Newest first)'
	}
}

const durationFormatter = (dur: moment.Duration) => {
	return dur.humanize()
}

export const formatResult = (
	count: number,
	totalTime: moment.Duration | undefined,
	activeTime: moment.Duration | undefined,
	format: SESSION_FEED_RESULT_FORMAT,
) => {
	if (count === 0) {
		return `${count.toLocaleString()} results`
	} else if (
		format === 'Count/Length/ActiveLength' &&
		totalTime &&
		activeTime
	) {
		return `${count.toLocaleString()} results, ${durationFormatter(totalTime)} total, ${durationFormatter(activeTime)} active`
	} else if (format === 'Active Length' && activeTime) {
		return durationFormatter(activeTime)
	} else if (format === 'Length' && totalTime) {
		return durationFormatter(totalTime)
	}
	return `${count.toLocaleString()} results`
}
