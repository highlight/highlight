import { makeVar, useReactiveVar } from '@apollo/client'
import moment from 'moment'

export const FORMAT = 'YYYY-MM-DDTHH:mm:00.000000000Z'

export const defaultEndDate = moment()
export const defaultLookback = 7 * 24 * 60
export const defaultStartDate = moment(defaultEndDate).subtract(
	defaultLookback,
	'minutes',
)

export interface DataTimeRange {
	start_date: string
	end_date: string
	lookback: number // in minutes
	absolute: boolean
}

export const defaultDataTimeRange = {
	start_date: defaultStartDate,
	end_date: defaultEndDate,
	lookback: defaultLookback,
	absolute: false,
}

const setDataTimeRange = makeVar<DataTimeRange>({
	...defaultDataTimeRange,
	start_date: defaultDataTimeRange.start_date.format(FORMAT),
	end_date: defaultDataTimeRange.end_date.format(FORMAT),
})

const useDataTimeRange = () => {
	const timeRange = useReactiveVar(setDataTimeRange)

	const setTimeRange = (start: string, end: string, absolute = false) => {
		const startDate = moment(start).startOf('minute')
		const endDate = moment(end).startOf('minute')
		const lookback = moment.duration(endDate.diff(startDate)).asMinutes()

		setDataTimeRange({
			start_date: startDate.format(FORMAT),
			end_date: endDate.format(FORMAT),
			lookback,
			absolute,
		})
	}

	const resetTimeRange = () => {
		const now = moment()

		setTimeRange(
			moment(now).subtract(defaultLookback, 'minutes').format(FORMAT),
			moment(now).format(FORMAT),
		)
	}

	return { timeRange, setTimeRange, resetTimeRange }
}

export default useDataTimeRange
