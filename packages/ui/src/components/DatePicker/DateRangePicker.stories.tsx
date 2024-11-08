import { Meta } from '@storybook/react'

import { Box } from '../Box/Box'

import { DateRangePicker, DEFAULT_TIME_PRESETS } from './DateRangePicker'
import { useState } from 'react'

export default {
	title: 'Components/DateRangePicker',
	component: DateRangePicker,
	decorators: [
		(Story) => (
			<Box style={{ width: 300 }}>
				<Story />
			</Box>
		),
	],
} as Meta<typeof DateRangePicker>

export const Basic = () => {
	const [defaultPreset, setDefaultPreset] = useState(DEFAULT_TIME_PRESETS[2])
	return (
		<DateRangePicker
			selectedValue={{
				startDate: new Date(),
				endDate: new Date(),
				selectedPreset: DEFAULT_TIME_PRESETS[2],
			}}
			onDatesChange={() => {
				return null
			}}
			presets={DEFAULT_TIME_PRESETS}
			minDate={new Date()}
			defaultPreset={defaultPreset}
			setDefaultPreset={setDefaultPreset}
		/>
	)
}
