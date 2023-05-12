import React, { useState } from 'react'
import { ComponentMeta } from '@storybook/react'

import { DatePicker } from './Calendar/DatePicker'
import { Text } from '../Text/Text'
import { Stack } from '../Stack/Stack'
import { Box } from '../Box/Box'
import {
	PreviousDateRangePicker,
	makeDefaultPresets,
} from './PreviousDateRangePicker'
import { subtractDays, subtractHours } from './utils'

export default {
	title: 'Components/DatePicker/PreviousDateRangePicker',
	component: DatePicker,
} as ComponentMeta<typeof DatePicker>

const now = new Date()

const defaultPresets = makeDefaultPresets(now)

export { subtractDays, subtractHours } from './utils'

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
				presets={defaultPresets}
				minDate={subtractDays(now, 90)}
			/>
		</div>
	)
}
