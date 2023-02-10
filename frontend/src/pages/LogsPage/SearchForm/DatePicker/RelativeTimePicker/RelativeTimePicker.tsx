import { Box, IconSolidCheck, Menu, Popover, Stack } from '@highlight-run/ui'
import { DatePicker } from '@pages/LogsPage/SearchForm/DatePicker/DatePicker'
import { Preset } from '@pages/LogsPage/SearchForm/DatePicker/RelativeTimePicker/presets'
import { DatePickerStateProvider } from '@rehookify/datepicker'
import moment from 'moment'
import { useState } from 'react'

interface Props {
	initialStartDate: Date
	initialEndDate: Date
	initialPreset: Preset
	presets: Preset[]
	onDatesSelected: (startDate: Date, endDate: Date) => void
}

const IsSelectedCheckbox = ({
	selectedPreset,
	preset,
}: {
	selectedPreset: Preset
	preset: Preset
}) => {
	const isSelected = selectedPreset == preset
	return (
		<Box visibility={isSelected ? 'visible' : 'hidden'}>
			<IconSolidCheck />
		</Box>
	)
}

const RelativeTimePicker = ({
	initialStartDate,
	initialEndDate,
	initialPreset,
	presets,
	onDatesSelected,
}: Props) => {
	const [showCustom, setShowCustom] = useState(false)
	const [selectedDates, setSelectedDates] = useState<Date[]>([
		initialStartDate,
		initialEndDate,
	])
	const [selectedPreset, setSelectedPreset] = useState<Preset>(initialPreset)

	const handleDatesChange = (newDates: Date[]) => {
		setSelectedDates(newDates)
		if (newDates.length == 2) {
			onDatesSelected(
				newDates[0],
				moment(newDates[1]).endOf('day').toDate(),
			)
			setShowCustom(false)
		}
	}

	if (showCustom) {
		return (
			<Popover open={true}>
				<Popover.ButtonTrigger kind="secondary">
					{selectedPreset.label}
				</Popover.ButtonTrigger>
				<Popover.Content>
					<DatePickerStateProvider
						config={{
							selectedDates,
							onDatesChange: handleDatesChange,
							dates: {
								mode: 'range',
								maxDate: new Date(),
							},
						}}
					>
						<DatePicker />
					</DatePickerStateProvider>
				</Popover.Content>
			</Popover>
		)
	}

	const handleSelectPreset = (preset: Preset) => {
		setSelectedPreset(preset)
		handleDatesChange([preset.startDate, preset.endDate])
	}

	return (
		<Menu>
			<Menu.Button kind="secondary">{selectedPreset.label}</Menu.Button>
			<Menu.List>
				{presets.map((preset) => {
					return (
						<Menu.Item
							key={preset.label}
							onClick={() => handleSelectPreset(preset)}
						>
							<Stack direction="row" align="center">
								<IsSelectedCheckbox
									selectedPreset={selectedPreset}
									preset={preset}
								/>
								{preset.label}
							</Stack>
						</Menu.Item>
					)
				})}
				<Menu.Item onClick={() => setShowCustom(true)}>
					<Stack direction="row">
						<IconSolidCheck />
						Custom
					</Stack>
				</Menu.Item>
			</Menu.List>
		</Menu>
	)
}

export { RelativeTimePicker }
