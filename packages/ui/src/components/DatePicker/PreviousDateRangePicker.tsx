import React from 'react'

import { DatePicker } from './Calendar/DatePicker'
import { DatePickerStateProvider } from '@rehookify/datepicker'
import { Menu, useMenu } from '../Menu/Menu'
import { IconSolidCheveronDown } from '../icons'

export type Preset = {
	label: string
	startDate: Date
}

enum MenuState {
	Default,
	Custom,
}

export const getLabel = ({
	selectedDates,
	presets,
}: {
	selectedDates: Date[]
	presets: Preset[]
}) => {
	const foundPreset = presets.find((preset) => {
		return preset.startDate.getTime() === selectedDates[0].getTime()
	})

	if (foundPreset) {
		return foundPreset.label
	}

	if (selectedDates.length == 2) {
		return `${selectedDates[0].toDateString()} - ${selectedDates[1].toDateString()}`
	}
}

const now = new Date()

type Props = {
	selectedDates: Date[]
	onDatesChange: (selectedDates: Date[]) => void
	presets: Preset[]
}

export const PreviousDateRangePicker: React.FC<Props> = (props) => (
	<Menu placement="bottom-end">
		{/* Rendering inside wrapper so we can work with menu state via useMenu. */}
		<PreviousDateRangePickerImpl {...props} />
	</Menu>
)

const PreviousDateRangePickerImpl = ({
	selectedDates,
	onDatesChange,
	presets,
}: Props) => {
	const [menuState, setMenuState] = React.useState<MenuState>(
		MenuState.Default,
	)
	const menu = useMenu()

	const [buttonLabel, setButtonLabel] = React.useState<string>(
		getLabel({ selectedDates, presets }),
	)

	const handleDatesChange = (dates: Date[]) => {
		onDatesChange(dates)

		if (dates.length == 2) {
			menu.setOpen(false)
			setButtonLabel(getLabel({ selectedDates: dates, presets }))
			setMenuState(MenuState.Default)
		}
	}

	return (
		<DatePickerStateProvider
			config={{
				selectedDates,
				onDatesChange: handleDatesChange,
				dates: { mode: 'range', maxDate: new Date() },
			}}
		>
			<Menu.Button kind="secondary" iconRight={<IconSolidCheveronDown />}>
				{buttonLabel}
			</Menu.Button>
			<Menu.List>
				{menuState === MenuState.Default ? (
					<>
						{presets.map((preset) => {
							return (
								<Menu.Item
									key={preset.label}
									onClick={() =>
										handleDatesChange([
											preset.startDate,
											now,
										])
									}
								>
									{preset.label}
								</Menu.Item>
							)
						})}
						<Menu.Item
							onClick={(e) => {
								e.preventDefault()
								setMenuState(MenuState.Custom)
							}}
						>
							Custom
						</Menu.Item>
					</>
				) : (
					<Menu.Item onClick={(e) => e.preventDefault()}>
						<DatePicker />
					</Menu.Item>
				)}
			</Menu.List>
		</DatePickerStateProvider>
	)
}
