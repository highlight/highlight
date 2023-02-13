import React from 'react'

import { DatePicker } from './Calendar/DatePicker'
import { DatePickerStateProvider } from '@rehookify/datepicker'

type Props = {
	selectedDates: Date[]
	onDatesChange: (selectedDates: Date[]) => void
}

export const PreviousDateRangePicker = ({
	selectedDates,
	onDatesChange,
}: Props) => {
	return (
		<DatePickerStateProvider
			config={{
				selectedDates,
				onDatesChange,
				dates: { mode: 'range', maxDate: new Date() },
			}}
		>
			<DatePicker />
		</DatePickerStateProvider>
	)
}
