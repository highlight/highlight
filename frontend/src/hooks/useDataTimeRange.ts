import { makeVar, useReactiveVar } from '@apollo/client'
import moment from 'moment'

const FORMAT = 'YYYY-MM-DDTHH:mm:00.000000000Z'

const defaultEndDate = moment().format(FORMAT)
export const defaultLookback = 6 * 60

export interface DataTimeRange {
	start_date: string
	end_date: string
	lookback: number // in minutes
	absolute: boolean
}

const setDataTimeRange = makeVar<DataTimeRange>({
	start_date: moment(defaultEndDate)
		.subtract(defaultLookback, 'minutes')
		.format(FORMAT),
	end_date: defaultEndDate,
	lookback: defaultLookback,
	absolute: false,
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

	return { timeRange, setTimeRange }
}

export default useDataTimeRange
