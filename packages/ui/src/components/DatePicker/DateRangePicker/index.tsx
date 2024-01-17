import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'

import { DatePicker } from '../Calendar/DatePicker'
import { DatePickerStateProvider } from '@rehookify/datepicker'
import { Menu, MenuButtonProps, useMenu } from '../../Menu/Menu'
import { Text } from '../../Text/Text'
import {
	IconSolidCheck,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidClock,
} from '../../icons'
import { Stack } from '../../Stack/Stack'
import { Box } from '../../Box/Box'
import { colors } from '../../../css/colors'
import { TimeInput } from '../TimeInput'
import { DateInput } from '../DateInput'
import { Form } from '../../Form/Form'
import * as Ariakit from '@ariakit/react'

import { VALID_TIME_INPUT_FORMATS, VALID_DATE_INPUT_FORMATS } from './constants'
import {
	formatDisplayedDate,
	isPresetSelected,
	isCustomSelected,
	setTimeOnDate,
	getInputLabel,
	getTimeStringFromDate,
	getTimeInfo,
} from './helpers'

export type DateRangePreset = {
	unit: moment.DurationInputArg2
	quantity: number
	label?: string // defaults to `Last ${quantity} ${unit}`
	value?: string // defaults to `last_${quantity}_${unit}`
}

export enum MenuState {
	Default,
	Custom,
}

export type DateRangeValue = {
	startDate?: Date
	endDate?: Date
	selectedPreset?: DateRangePreset
}

export const DEFAULT_TIME_PRESETS: DateRangePreset[] = [
	{
		unit: 'minutes',
		quantity: 15,
	},
	{
		unit: 'minutes',
		quantity: 60,
	},
	{
		unit: 'hours',
		quantity: 4,
	},
	{
		unit: 'hours',
		quantity: 24,
	},
	{
		unit: 'days',
		quantity: 7,
	},
	{
		unit: 'days',
		quantity: 30,
	},
]

export const presetLabel = (preset: DateRangePreset) => {
	return preset.label || `Last ${preset.quantity} ${preset.unit}`
}

export const presetValue = (preset: DateRangePreset) => {
	return preset.value || `last_${preset.quantity}_${preset.unit}`
}

export const presetStartDate = (preset: DateRangePreset): Date => {
	return moment().subtract(preset.quantity, preset.unit).toDate()
}

type Props = {
	selectedValue: DateRangeValue
	onDatesChange: (
		startDate?: Date,
		endDate?: Date,
		presetId?: DateRangePreset,
	) => void
	presets: DateRangePreset[]
	minDate: Date
	maxDate?: Date
	noCustom?: boolean
} & Omit<MenuButtonProps, 'ref' | 'store'>

export const DateRangePicker: React.FC<Props> = (props) => (
	<Menu placement="bottom-end">
		{/* Rendering inside wrapper so we can work with menu store via useMenu. */}
		<DateRangePickerImpl {...props} />
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

const DateRangePickerImpl = ({
	selectedValue,
	onDatesChange,
	presets,
	noCustom,
	minDate,
	maxDate = moment().toDate(),
	...props
}: Props) => {
	const [menuState, setMenuState] = React.useState<MenuState>(
		MenuState.Default,
	)
	const [showingTime, setShowingTime] = useState<boolean>(false)
	const [startTimeIsValid, setStartTimeIsValid] = useState<boolean>(true)
	const [endTimeIsValid, setEndTimeIsValid] = useState<boolean>(true)

	const menu = useMenu()
	const open = menu.getState().open
	const formStore = Ariakit.useFormStore({})

	useEffect(() => {
		if (!open) {
			setMenuState(MenuState.Default)
		}
	}, [open])

	// Close the time picker when the menu is closed
	useEffect(() => {
		if (menuState === MenuState.Default) {
			setShowingTime(false)
		}
	}, [menuState])

	useEffect(() => {
		if (showingTime === false) {
			setStartTimeIsValid(true)
			setEndTimeIsValid(true)
		}
	}, [showingTime])

	const startDatePlaceholder = useMemo(
		() => formatDisplayedDate(selectedValue.startDate),
		[selectedValue.startDate],
	)

	const endDatePlaceholder = useMemo(
		() => formatDisplayedDate(selectedValue.endDate),
		[selectedValue.endDate],
	)

	const startTimePlaceholder = useMemo(
		() => getTimeStringFromDate(selectedValue.startDate),
		[selectedValue.startDate],
	)

	const endTimePlaceholder = useMemo(
		() => getTimeStringFromDate(selectedValue.endDate, true),
		[selectedValue.endDate],
	)

	// TODO(spenny): check this works
	const isTimepickerDisabled = useMemo(
		() => !!selectedValue.startDate && !!selectedValue.endDate,
		[selectedValue.startDate, selectedValue.endDate],
	)

	const [buttonLabel, setButtonLabel] = useState<string>(
		getInputLabel({ selectedValue, presets }),
	)

	const handleShowingTimeToggle = () => {
		setShowingTime((prevShowingTime) => !prevShowingTime)
	}

	const handleDatesChange = ({
		startDate,
		endDate,
		selectedPreset,
	}: DateRangeValue) => {
		onDatesChange(startDate, endDate, selectedPreset)

		if (startDate && endDate) {
			menu.setOpen(false)
			setMenuState(MenuState.Default)
		}
	}

	const handleStartDateInput = (value: string) => {
		const isValidDateInput = VALID_DATE_INPUT_FORMATS.some((format) =>
			moment(value, format, true).isValid(),
		)

		if (isValidDateInput) {
			const newDate = moment(value).toDate()
			onDatesChange(newDate, selectedValue.endDate, undefined)
		}
	}

	const handleEndDateInput = (value: string) => {
		const isValidDateInput = []
			.map((format) => moment(value, format, true).isValid())
			.some((isValid) => isValid)

		if (isValidDateInput) {
			const newDate = moment(value).toDate()
			onDatesChange(selectedValue.startDate, newDate, undefined)
		}
	}

	const handleTimeChange = (value: string, input: 'start' | 'end') => {
		const isValid = VALID_TIME_INPUT_FORMATS.map((format) =>
			moment(value, format, true).isValid(),
		).some((isValid) => isValid)

		if (input === 'start') {
			setStartTimeIsValid(isValid)

			if (!isValid || !selectedValue.startDate) {
				return
			}

			const timeInfo = getTimeInfo(value)
			const startDate = setTimeOnDate(
				selectedValue.startDate,
				timeInfo.hour24,
				timeInfo.minute,
			)

			onDatesChange(startDate, selectedValue.endDate, undefined)

			return
		}

		setEndTimeIsValid(isValid)

		if (!isValid || !selectedValue.endDate) {
			return
		}

		const timeInfo = getTimeInfo(value)

		const endDate = setTimeOnDate(
			selectedValue.endDate,
			timeInfo.hour24,
			timeInfo.minute,
		)

		onDatesChange(selectedValue.startDate, endDate, undefined)
	}

	useEffect(() => {
		if (
			selectedValue.selectedPreset ||
			(selectedValue.startDate && selectedValue.endDate)
		) {
			setButtonLabel(getInputLabel({ selectedValue, presets }))
		}
	}, [selectedValue])

	const hasSelectedRange = useMemo(
		() =>
			selectedValue.startDate &&
			selectedValue.endDate &&
			[selectedValue.startDate, selectedValue.endDate].filter((date) =>
				moment(date).isValid(),
			).length === 2,
		[selectedValue],
	)

	const presetOptions = useMemo(() => {
		return presets.map((preset) => {
			return {
				label: presetLabel(preset),
				value: presetValue(preset),
				quantity: preset.quantity,
				unit: preset.unit,
			}
		})
	}, [presets])

	const handleAbsoluteDateChange = (selectedDates: Date[]) => {
		let startDate = selectedDates[0]
		let endDate = selectedDates[1]
		if (startDate) {
			startDate = moment
				.max(moment(startDate).startOf('day'), moment(minDate))
				.toDate()
		}
		if (endDate) {
			endDate = moment
				.min(moment(endDate).endOf('day'), moment(maxDate))
				.toDate()
		}

		handleDatesChange({ startDate, endDate })
	}

	const handlePresetSelected = (preset: DateRangePreset) => {
		handleDatesChange({
			selectedPreset: preset,
		})
	}

	const dateValues = [selectedValue.startDate, selectedValue.endDate].filter(
		(date) => !!date,
	) as Date[]

	return (
		<DatePickerStateProvider
			config={{
				selectedDates: dateValues,
				onDatesChange: handleAbsoluteDateChange,
				dates: {
					mode: 'range',
					minDate,
					maxDate,
					selectSameDate: true,
				},
			}}
		>
			<Menu.Button
				kind="secondary"
				iconRight={<IconSolidCheveronDown />}
				style={{
					whiteSpace: 'nowrap',
					overflow: 'hidden',
				}}
				{...(props as Omit<MenuButtonProps, 'ref'>)}
			>
				{buttonLabel}
			</Menu.Button>
			<Menu.List>
				{menuState === MenuState.Default ? (
					<>
						{presetOptions.map((preset) => {
							return (
								<Menu.Item
									key={preset.label}
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										handlePresetSelected(preset)
									}}
								>
									<Stack
										py="2"
										direction="row"
										align="center"
										gap="4"
									>
										<CheckboxIconIfSelected
											isSelected={isPresetSelected(
												preset,
												selectedValue.selectedPreset,
											)}
										/>
										<Text userSelect="none">
											{preset.label}
										</Text>
									</Stack>
								</Menu.Item>
							)
						})}
						{noCustom ? null : (
							<Menu.Item
								onClick={(e) => {
									e.preventDefault()
									e.stopPropagation()
									setMenuState(MenuState.Custom)
								}}
							>
								<Stack
									width={'full'}
									display={'flex'}
									direction={'row'}
									alignItems={'center'}
									justifyContent={'space-between'}
								>
									<Stack
										direction="row"
										align="center"
										gap="4"
									>
										<CheckboxIconIfSelected
											isSelected={isCustomSelected({
												presets,
												selectedValue,
											})}
										/>
										<Text userSelect="none">Custom</Text>
									</Stack>
									<IconSolidCheveronRight size={16} />
								</Stack>
							</Menu.Item>
						)}
					</>
				) : (
					<Form store={formStore}>
						<Box
							borderBottom={'divider'}
							pb={'4'}
							px={'4'}
							display={'flex'}
							gap={'4'}
						>
							<Box style={{ width: 116 }}>
								<Box
									border={'secondary'}
									borderTopLeftRadius={'6'}
									borderTopRightRadius={'6'}
									borderBottomLeftRadius={
										showingTime ? undefined : '6'
									}
									borderBottomRightRadius={
										showingTime ? undefined : '6'
									}
									style={{
										height: 28,
									}}
								>
									<DateInput
										name="startDate"
										placeholder={
											startDatePlaceholder || 'Start date'
										}
										onDateChange={function (value: string) {
											handleStartDateInput(value)
										}}
									/>
								</Box>
								{showingTime ? (
									<Box
										border={
											startTimeIsValid
												? 'secondary'
												: 'error'
										}
										borderTop={
											startTimeIsValid ? 'none' : 'error'
										}
										borderBottomLeftRadius={'6'}
										borderBottomRightRadius={'6'}
										style={{
											height: 28,
										}}
									>
										<TimeInput
											name="startTime"
											placeholder={startTimePlaceholder}
											onTimeChange={function (value) {
												handleTimeChange(value, 'start')
											}}
										/>
									</Box>
								) : null}
							</Box>
							<Box style={{ width: 116 }}>
								<Box
									border={'secondary'}
									borderTopLeftRadius={'6'}
									borderTopRightRadius={'6'}
									borderBottomLeftRadius={
										showingTime ? undefined : '6'
									}
									borderBottomRightRadius={
										showingTime ? undefined : '6'
									}
									style={{
										height: 28,
									}}
								>
									<DateInput
										name="endDate"
										placeholder={
											endDatePlaceholder || 'End date'
										}
										onDateChange={function (value: string) {
											handleEndDateInput(value)
										}}
									/>
								</Box>
								{showingTime ? (
									<Box
										border={
											endTimeIsValid
												? 'secondary'
												: 'error'
										}
										borderTop={
											endTimeIsValid ? 'none' : 'error'
										}
										borderBottomLeftRadius={'6'}
										borderBottomRightRadius={'6'}
										py="0"
										style={{
											height: 28,
										}}
									>
										<TimeInput
											name="endTime"
											placeholder={endTimePlaceholder}
											onTimeChange={function (value) {
												handleTimeChange(value, 'end')
											}}
										/>
									</Box>
								) : null}
							</Box>
							<Box
								border={showingTime ? 'none' : 'divider'}
								borderRadius={'6'}
								as="button"
								p={'7'}
								display={'flex'}
								justifyContent={'center'}
								cursor={
									isTimepickerDisabled
										? 'not-allowed'
										: 'pointer'
								}
								background={'n4'}
								alignItems={'center'}
								style={{
									width: 28,
									height: 28,
									background: showingTime
										? colors.p9
										: colors.n4,
									boxShadow: showingTime
										? '0px -1px 0px rgba(0, 0, 0, 0.32) inset'
										: undefined,
								}}
								disabled={isTimepickerDisabled}
								onClick={handleShowingTimeToggle}
							>
								<IconSolidClock
									style={{
										color: showingTime
											? colors.white
											: colors.n11,
									}}
								/>
							</Box>
						</Box>

						<Menu.Item
							style={{ padding: 0 }}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
							}}
						>
							<DatePicker hasSelectedRange={hasSelectedRange} />
						</Menu.Item>
					</Form>
				)}
			</Menu.List>
		</DatePickerStateProvider>
	)
}
