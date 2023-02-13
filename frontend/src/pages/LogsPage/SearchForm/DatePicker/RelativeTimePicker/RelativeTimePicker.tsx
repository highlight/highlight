import { Box, IconSolidCheck, Menu, Popover, Stack } from '@highlight-run/ui'
import { DatePicker } from '@pages/LogsPage/SearchForm/DatePicker/DatePicker'
import { Preset } from '@pages/LogsPage/SearchForm/DatePicker/RelativeTimePicker/presets'
import { DatePickerStateProvider } from '@rehookify/datepicker'
import { useState } from 'react'

const IsSelectedCheckbox = ({
	selectedPreset,
	preset,
	isCustom,
}: {
	selectedPreset: Preset | undefined
	preset?: Preset
	isCustom: boolean
}) => {
	let isSelected: boolean
	if (isCustom && !selectedPreset) {
		isSelected = true
	} else {
		isSelected = selectedPreset == preset
	}

	return (
		<Box visibility={isSelected ? 'visible' : 'hidden'}>
			<IconSolidCheck />
		</Box>
	)
}

const getLabel = ({
	selectedPreset,
	selectedDates,
}: {
	selectedPreset?: Preset
	selectedDates: Date[]
}) => {
	if (selectedPreset) {
		return selectedPreset.label
	}

	if (selectedDates.length == 2) {
		return `${selectedDates[0].toDateString()} - ${selectedDates[1].toDateString()}`
	}
}

interface Props {
	presets: Preset[]
	selectedPreset: Preset | undefined
	onPresetSelected: (preset: Preset | undefined) => void
	selectedDates: Date[]
	onDatesSelected: (selectedDates: Date[]) => void
}

const RelativeTimePicker = ({
	presets,
	selectedPreset,
	onPresetSelected,
	selectedDates,
	onDatesSelected,
}: Props) => {
	const [showCustom, setShowCustom] = useState(false)

	const handleDatesChange = (newDates: Date[]) => {
		onDatesSelected(newDates)
		if (newDates.length == 2) {
			onPresetSelected(undefined)
			setShowCustom(false)
		}
	}

	if (showCustom) {
		return (
			<Popover open={true}>
				<Popover.ButtonTrigger kind="secondary">
					{getLabel({ selectedPreset, selectedDates })}
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
		onPresetSelected(preset)
		onDatesSelected([preset.startDate, preset.endDate])
	}

	return (
		<Menu>
			<Menu.Button kind="secondary">
				{getLabel({ selectedPreset, selectedDates })}
			</Menu.Button>
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
									isCustom={false}
								/>
								{preset.label}
							</Stack>
						</Menu.Item>
					)
				})}
				<Menu.Item onClick={() => setShowCustom(true)}>
					<Stack direction="row">
						<IsSelectedCheckbox
							selectedPreset={selectedPreset}
							isCustom={true}
						/>
						Custom
					</Stack>
				</Menu.Item>
			</Menu.List>
		</Menu>
	)
}

export { RelativeTimePicker }
