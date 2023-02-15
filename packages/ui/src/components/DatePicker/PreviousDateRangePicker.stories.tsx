import React, { useState } from 'react'
import { ComponentMeta } from '@storybook/react'

import { DatePicker } from './Calendar/DatePicker'
import { Text } from '../Text/Text'
import { Stack } from '../Stack/Stack'
import { Box } from '../Box/Box'
import { Preset, PreviousDateRangePicker } from './PreviousDateRangePicker'
import { subtractDays, subtractHours } from './utils'

export default {
	title: 'Components/DatePicker/PreviousDateRangePicker',
	component: DatePicker,
} as ComponentMeta<typeof DatePicker>

const now = new Date()

const presets: Preset[] = [
	{
		label: 'Last 4 hours',
		startDate: subtractHours(now, 4),
	},
	{
		label: 'Last 12 hours',
		startDate: subtractHours(now, 12),
	},
	{
		label: 'Last 24 hours',
		startDate: subtractHours(now, 24),
	},
	{
		label: 'Last 3 days',
		startDate: subtractDays(now, 3),
	},
]

export const Basic = () => {
	const [selectedDates, onDatesChange] = useState<Date[]>([
		subtractHours(now, 4),
		now,
	])

	return (
		<div style={{ minHeight: '300px' }}>
			<Box display="flex" mb="20" gap={'40'}>
				<Stack direction="row">
					<Text weight="bold">From:</Text>
					<Text>{selectedDates[0].toLocaleString()}</Text>
				</Stack>

				<Stack direction="row">
					<Text weight="bold">To:</Text>
					{selectedDates.length == 2 && (
						<Text>{selectedDates[1].toLocaleString()}</Text>
					)}
				</Stack>
			</Box>

			<PreviousDateRangePicker
				selectedDates={selectedDates}
				onDatesChange={onDatesChange}
				presets={presets}
				minDate={subtractDays(now, 90)}
			/>
		</div>
	)
}
