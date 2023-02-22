import React, { useMemo } from 'react'

import { DatePicker } from './Calendar/DatePicker'
import { DatePickerStateProvider } from '@rehookify/datepicker'
import { Menu, MenuButtonProps, useMenu } from '../Menu/Menu'
import { Text } from '../Text/Text'
import { IconSolidCheck, IconSolidCheveronDown } from '../icons'
import { Stack } from '../Stack/Stack'
import { Box } from '../Box/Box'

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
} & Omit<MenuButtonProps, 'ref'>

export const PreviousDateRangePicker: React.FC<Props> = (props) => (
	<Menu placement="bottom-end">
		{/* Rendering inside wrapper so we can work with menu state via useMenu. */}
		<PreviousDateRangePickerImpl {...props} />
	</Menu>
)

const CheckboxIconIfSelected = ({
	isSelected,
	size = 16,
}: {
	isSelected: boolean
	size?: number
}) => {
	return (
		<Box style={{ height: size, width: size }} color="primaryEnabled">
			{isSelected && <IconSolidCheck size={size} />}
		</Box>
	)
}

const PreviousDateRangePickerImpl = ({
	selectedDates,
	onDatesChange,
	presets,
	minDate,
	...props
}: Props) => {
	const [menuState, setMenuState] = React.useState<MenuState>(
		MenuState.Default,
	)
	const menu = useMenu()

	const buttonLabel = useMemo(() => {
		return getLabel({ selectedDates, presets })
	}, [selectedDates[0]?.getTime()])

	const handleDatesChange = (dates: Date[]) => {
		onDatesChange(dates)

		if (dates.length == 2) {
			menu.setOpen(false)
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
			<Menu.Button
				kind="secondary"
				iconRight={<IconSolidCheveronDown />}
				{...(props as Omit<MenuButtonProps, 'ref'>)}
			>
				{buttonLabel}
			</Menu.Button>
			<Menu.List>
				{menuState === MenuState.Default ? (
					<>
						{presets.map((preset) => {
							return (
								<Menu.Item
									key={preset.label}
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										handleDatesChange([
											preset.startDate,
											now,
										])
									}}
								>
									<Stack
										direction="row"
										align="center"
										gap="4"
									>
										<CheckboxIconIfSelected
											isSelected={isPresetSelected({
												preset,
												selectedDates,
											})}
										/>
										<Text userSelect="none">
											{preset.label}
										</Text>
									</Stack>
								</Menu.Item>
							)
						})}
						<Menu.Item
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								setMenuState(MenuState.Custom)
							}}
						>
							<Stack direction="row" align="center" gap="4">
								<CheckboxIconIfSelected
									isSelected={isCustomSelected({
										presets,
										selectedDates,
									})}
								/>
								<Text userSelect="none">Custom</Text>
							</Stack>
						</Menu.Item>
					</>
				) : (
					<Menu.Item
						style={{ padding: 0 }}
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
						}}
					>
						<DatePicker />
					</Menu.Item>
				)}
			</Menu.List>
		</DatePickerStateProvider>
	)
}
