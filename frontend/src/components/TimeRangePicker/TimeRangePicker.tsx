import { PreviousDateRangePicker } from '@highlight-run/ui/components'
import useDataTimeRange, {
	defaultDataTimeRange,
	FORMAT,
} from '@hooks/useDataTimeRange'
import moment from 'moment'
import React, { useEffect, useState } from 'react'

const presets = [
	{
		label: 'Last 5 minutes',
		startDate: new Date(moment().subtract(5, 'minutes').format(FORMAT)),
	},
	{
		label: 'Last 15 minutes',
		startDate: moment().subtract(15, 'minutes').toDate(),
	},
	{
		label: 'Last 1 hour',
		startDate: moment().subtract(1, 'hour').toDate(),
	},
	{
		label: 'Last 6 hours',
		startDate: moment().subtract(6, 'hours').toDate(),
	},
	{
		label: 'Last 24 hours',
		startDate: moment().subtract(24, 'hours').toDate(),
	},
	{
		label: 'Last 7 days',
		startDate: moment().subtract(7, 'days').toDate(),
	},
	{
		label: 'Last 30 days',
		startDate: moment().subtract(30, 'days').toDate(),
	},
]

const minDate = moment(defaultDataTimeRange.end_date)
	.subtract(90, 'days')
	.toDate()

const TimeRangePicker: React.FC<React.PropsWithChildren<unknown>> = () => {
	const [customDateRange, setCustomDateRange] = useState<Date[]>([
		presets[5].startDate,
		moment().toDate(),
	])
	const { setTimeRange } = useDataTimeRange()

	useEffect(() => {
		if (!customDateRange[0] || !customDateRange[1]) {
			return
		}

		setTimeRange(
			moment(customDateRange[0]).format(FORMAT),
			moment(customDateRange[1]).format(FORMAT),
		)
	}, [customDateRange, setTimeRange])

	return (
		<PreviousDateRangePicker
			presets={presets}
			selectedDates={customDateRange}
			onDatesChange={setCustomDateRange}
			minDate={minDate}
		/>
	)
}

export default TimeRangePicker
