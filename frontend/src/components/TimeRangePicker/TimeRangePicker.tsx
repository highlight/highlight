import {
	Preset,
	presetStartDate,
	PreviousDateRangePicker,
} from '@highlight-run/ui/components'
import useDataTimeRange, {
	defaultDataTimeRange,
	FORMAT,
} from '@hooks/useDataTimeRange'
import moment from 'moment'
import React, { useEffect, useState } from 'react'

const presets: Preset[] = [
	{
		quantity: 5,
		unit: 'minutes',
	},
	{
		quantity: 15,
		unit: 'minutes',
	},
	{
		quantity: 1,
		unit: 'hour',
	},
	{
		quantity: 6,
		unit: 'hours',
	},
	{
		quantity: 24,
		unit: 'hours',
	},
	{
		quantity: 7,
		unit: 'days',
	},
	{
		quantity: 30,
		unit: 'days',
	},
]

const minDate = moment(defaultDataTimeRange.end_date)
	.subtract(90, 'days')
	.toDate()

const TimeRangePicker: React.FC<React.PropsWithChildren<unknown>> = () => {
	const [customDateRange, setCustomDateRange] = useState<Date[]>([
		presetStartDate(presets[5]),
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

	const handleDatesChange = (newStartDate?: Date, newEndDate?: Date) => {
		if (!newStartDate || !newEndDate) {
			return
		}

		setCustomDateRange([newStartDate, newEndDate])
	}

	// TODO(spenny): should this use some sort of preset state?
	return (
		<PreviousDateRangePicker
			presets={presets}
			selectedValue={{
				startDate: customDateRange[0],
				endDate: customDateRange[1],
			}}
			onDatesChange={handleDatesChange}
			minDate={minDate}
		/>
	)
}

export default TimeRangePicker
