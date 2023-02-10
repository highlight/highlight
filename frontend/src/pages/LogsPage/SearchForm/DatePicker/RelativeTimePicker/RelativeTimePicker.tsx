import { Box, IconSolidCheck, Menu, Popover, Stack } from '@highlight-run/ui'
import { DatePicker } from '@pages/LogsPage/SearchForm/DatePicker/DatePicker'
import { Preset } from '@pages/LogsPage/SearchForm/DatePicker/RelativeTimePicker/presets'
import { DatePickerStateProvider } from '@rehookify/datepicker'
import moment from 'moment'
import { useState } from 'react'

interface Props {
	initialStartDate: Date | undefined
	initialEndDate: Date | undefined
	initialPreset: Preset
	presets: Preset[]
	onDatesSelected: (startDate: Date, endDate: Date) => void
}

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
	return selectedPreset
		? selectedPreset.label
		: `${selectedDates[0].toDateString()} - ${selectedDates[1].toDateString()}`
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
		initialStartDate ?? initialPreset.startDate,
		initialEndDate ?? initialPreset.endDate,
	])
	const [selectedPreset, setSelectedPreset] = useState<Preset | undefined>(
		initialStartDate && initialEndDate ? undefined : initialPreset,
	)

	const handleDatesChange = (newDates: Date[]) => {
		setSelectedDates(newDates)
		if (newDates.length == 2) {
			setSelectedPreset(undefined)

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
		setSelectedPreset(preset)
		handleDatesChange([preset.startDate, preset.endDate])
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
