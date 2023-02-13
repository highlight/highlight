import React, { useState } from 'react'
import { ComponentMeta } from '@storybook/react'

import { DatePicker } from './Calendar/DatePicker'
import { Text } from '../Text/Text'
import { Stack } from '../Stack/Stack'
import { Box } from '../Box/Box'
import { PreviousDateRangePicker } from './PreviousDateRangePicker'

export default {
	title: 'Components/DatePicker/PreviousDateRangePicker',
	component: DatePicker,
} as ComponentMeta<typeof DatePicker>

const dateOffset = 24 * 60 * 60 * 1000 * 5 // 5 days

export const PreviousDateRange = () => {
	const to = new Date()
	const from = new Date(to.getTime() - dateOffset)
	const [selectedDates, onDatesChange] = useState<Date[]>([from, to])
	return (
		<>
			<Box display="flex" mb="20" gap={'40'}>
				<Stack direction="row">
					<Text weight="bold">From:</Text>
					<Text>{selectedDates[0].toDateString()}</Text>
				</Stack>

				<Stack direction="row">
					<Text weight="bold">To:</Text>
					{selectedDates.length == 2 && (
						<Text>{selectedDates[1].toDateString()}</Text>
					)}
				</Stack>
			</Box>

			<PreviousDateRangePicker
				selectedDates={selectedDates}
				onDatesChange={onDatesChange}
			/>
		</>
	)
}
