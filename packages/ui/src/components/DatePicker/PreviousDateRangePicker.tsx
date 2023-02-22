import React from 'react'

import { DatePicker } from './Calendar/DatePicker'
import { DatePickerStateProvider } from '@rehookify/datepicker'
import { Menu, useMenu } from '../Menu/Menu'
import { Text } from '../Text/Text'
import { IconSolidCheck, IconSolidCheveronDown } from '../icons'
import { Stack } from '../Stack/Stack'

export type Preset = {
	label: string
	startDate: Date
}

enum MenuState {
	Default,
	Custom,
}

const isPresetSelected = ({
	preset,
	selectedDates,
}: {
	preset: Preset
	selectedDates: Date[]
}) => {
	return preset.startDate.getTime() === selectedDates[0].getTime()
}

const isCustomSelected = ({
	presets,
	selectedDates,
}: {
	presets: Preset[]
	selectedDates: Date[]
}) => {
	const foundPreset = presets.find((preset) => {
		return isPresetSelected({ preset, selectedDates })
	})

	return !foundPreset
}

export const getLabel = ({
	selectedDates,
	presets,
}: {
	selectedDates: Date[]
	presets: Preset[]
}) => {
	const foundPreset = presets.find((preset) => {
		return isPresetSelected({ preset, selectedDates })
	})

	if (foundPreset) {
		return foundPreset.label
	}

	if (selectedDates.length == 2) {
		return `${selectedDates[0].toDateString()} - ${selectedDates[1].toDateString()}`
	}

	return ''
}

const now = new Date()

type Props = {
	selectedDates: Date[]
	onDatesChange: (selectedDates: Date[]) => void
	presets: Preset[]
	minDate: Date
}

export const PreviousDateRangePicker: React.FC<Props> = (props) => (
	<Menu placement="bottom-end">
		{/* Rendering inside wrapper so we can work with menu state via useMenu. */}
		<PreviousDateRangePickerImpl {...props} />
	</Menu>
)

const CheckboxIconIfSelected = ({ isSelected }: { isSelected: boolean }) => {
	return (
		<div style={{ height: 16, width: 16 }}>
			{isSelected && <IconSolidCheck size={16} />}
		</div>
	)
}

const PreviousDateRangePickerImpl = ({
	selectedDates,
	onDatesChange,
	presets,
	minDate,
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
				dates: { mode: 'range', minDate, maxDate: new Date() },
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
									<Stack
										py="2"
										direction="row"
										align="center"
										gap={'4'}
									>
										<CheckboxIconIfSelected
											isSelected={isPresetSelected({
												preset,
												selectedDates,
											})}
										/>
										{preset.label}
									</Stack>
								</Menu.Item>
							)
						})}
						<Menu.Item
							onClick={(e) => {
								e.preventDefault()
								setMenuState(MenuState.Custom)
							}}
						>
							<Stack direction="row" align="center" gap={'4'}>
								<CheckboxIconIfSelected
									isSelected={isCustomSelected({
										presets,
										selectedDates,
									})}
								/>
								Custom
							</Stack>
						</Menu.Item>
					</>
				) : (
					<Menu.Item
						style={{ padding: 0 }}
						onClick={(e) => e.preventDefault()}
					>
						<DatePicker />
					</Menu.Item>
				)}
			</Menu.List>
		</DatePickerStateProvider>
	)
}
