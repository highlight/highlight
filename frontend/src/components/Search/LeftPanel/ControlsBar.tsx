import {
	DateRangePicker,
	DateRangePreset,
	IconSolidClock,
	IconSolidCloseLeft,
	IconSolidOpenLeft,
	Stack,
} from '@highlight-run/ui/components'
import React from 'react'

import { Button } from '@components/Button'
import { TIME_MODE } from '@/components/Search/SearchForm/constants'

interface Props {
	showControlsPanel: boolean
	setShowControlsPanel: (show: boolean) => void
	startDate: Date
	endDate: Date
	presets: DateRangePreset[]
	minDate: Date
	selectedPreset?: DateRangePreset
	timeMode: TIME_MODE
	onDatesChange: (
		startDate: Date,
		endDate: Date,
		preset?: DateRangePreset,
	) => void
}

export const ControlsBar: React.FC<Props> = ({
	showControlsPanel,
	setShowControlsPanel,
	startDate,
	endDate,
	presets,
	minDate,
	selectedPreset,
	timeMode,
	onDatesChange,
}) => {
	return (
		<Stack
			paddingLeft="12"
			paddingRight="8"
			borderBottom="dividerWeak"
			direction="row"
			justifyContent="space-between"
			alignItems="center"
			py="6"
			gap="8"
			style={{ height: 36 }}
		>
			<Button
				trackingId="toggle-controls-panel"
				emphasis="medium"
				kind="secondary"
				size="xSmall"
				iconLeft={
					showControlsPanel ? (
						<IconSolidCloseLeft size={14} />
					) : (
						<IconSolidOpenLeft size={14} />
					)
				}
				onClick={() => setShowControlsPanel(!showControlsPanel)}
			>
				{showControlsPanel ? 'Hide Controls' : 'Show Controls'}
			</Button>
			<DateRangePicker
				size="xSmall"
				kind="secondary"
				emphasis="low"
				iconLeft={<IconSolidClock />}
				selectedValue={{
					startDate,
					endDate,
					selectedPreset,
				}}
				onDatesChange={onDatesChange}
				presets={presets}
				minDate={minDate}
				disabled={timeMode === 'permalink'}
			/>
		</Stack>
	)
}
