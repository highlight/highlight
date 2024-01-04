import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'

import { DatePicker } from './Calendar/DatePicker'
import { DatePickerStateProvider } from '@rehookify/datepicker'
import { Menu, MenuButtonProps, useMenu } from '../Menu/Menu'
import { Text } from '../Text/Text'
import {
	IconSolidCheck,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidClock,
} from '../icons'
import { Stack } from '../Stack/Stack'
import { Box } from '../Box/Box'
import { colors } from '../../css/colors'
import { TimeInput } from './TimeInput'
import { DateInput } from './DateInput'
import { Form } from '../Form/Form'
import * as Ariakit from '@ariakit/react'

export {
	defaultPresets,
	getNow,
	resetRelativeDates,
	presetStartDate,
} from './utils'

const DATE_INPUT_FORMAT_WITH_COMMA = 'MMM DD, YYYY'
const DATE_INPUT_FORMAT_WITH_SINGLE_DAY = 'MMM D, YYYY'
const DATE_INPUT_FORMAT_WITH_SINGLE_DAY_AND_NO_COMMA = 'MMM D YYYY'
const DATE_INPUT_FORMAT_WITH_NO_COMMA = 'MMM DD YYYY'
const DATE_INPUT_FORMAT_WITH_SLASH = 'MM/DD/YYYY'
const DATE_INPUT_FORMAT_WITH_DASH = 'MM-DD-YYYY'
const DATE_INPUT_FORMAT_WITH_DOT = 'MM.DD.YYYY'

const TIME_INPUT_FORMAT = 'HH:mm a'
const TIME_INPUT_FORMAT_NO_SPACE = 'HH:mma'

const TIME_INPUT_FORMAT_12_HOUR = 'h:mm a'
const TIME_INPUT_FORMAT_12_HOUR_NO_SPACE = 'h:mma'
const TIME_INPUT_FORMAT_24_HOURS_MINUTES_NO_AM_PM_24 = 'HH:mm'
const TIME_INPUT_FORMAT_12_HOURS_NO_AM_PM = 'h:mm'

const TIME_INPUT_FORMAT_HOURS_NO_MINUTES = 'h a'
const TIME_INPUT_FORMAT_HOURS_NO_MINUTES_NO_AM_PM = 'h'
const TIME_INPUT_FORMAT_HOURS_NO_MINUTES_NO_SPACE = 'ha'
const TIME_INPUT_FORMAT_HOURS_NO_MINUTES_NO_AM_PM_24_HOUR = 'HH'

const TIME_DISPLAY_FORMAT = 'hh:mm a'

export type Preset = {
	unit: moment.DurationInputArg2
	quantity: number
	label?: string // defaults to `Last ${quantity} ${unit}`
	value?: string // defaults to `last_${quantity}_${unit}`
}

enum MenuState {
	Default,
	Custom,
}

const presetLabel = (preset: Preset) => {
	return preset.label || `Last ${preset.quantity} ${preset.unit}`
}

export const presetValue = (preset: Preset) => {
	return preset.value || `last_${preset.quantity}_${preset.unit}`
}

const isPresetSelected = (preset: Preset, selectedPreset?: Preset) => {
	if (!selectedPreset) {
		return false
	}

	return presetValue(selectedPreset) === presetValue(preset)
}

const isCustomSelected = ({
	presets,
	selectedValue,
}: {
	presets: Preset[]
	selectedValue: SelectedValue
}) => {
	const foundPreset = presets.find((preset) => {
		return isPresetSelected(preset, selectedValue.selectedPreset)
	})

	return !foundPreset
}

function toDateTimeString(date: Date, showYear: boolean) {
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}

	if (showYear) {
		options.year = 'numeric'
	}
	return date.toLocaleDateString('en-us', options)
}

/**
 * Takes in a time string in the format HH:mm aa or HH:mmaa and returns	an object with the hour, minute, time of day, and 24 hour time
 * @param timeString
 * @returns {	hour: number, minute: number, timeOfDay: string, hour24: number}
 */
export const getTimeInfo = (timeString: string) => {
	const date = moment(timeString, TIME_INPUT_FORMAT)
	return {
		hour: date.format('HH'),
		minute: date.minute(),
		timeOfDay: date.format('a'),
		hour24: date.hour(),
	}
}

/**
 * Takes in a date and a time string in the format HH:mm aa or HH:mmaa and returns a new date with the time set
 * @param date Date
 * @param hour number
 * @param minute number
 * @returns new date	with time set
 */
const setTimeOnDate = (date: Date, hour: number, minute: number) => {
	const newDate = new Date(date)

	newDate.setHours(hour)
	newDate.setMinutes(minute)

	return newDate
}

/**
 * Converts a Date object to a string in the format "HH:mm aa".
 *
 * @param {Date} date - The Date object to convert.
 * @returns {string} A string in the format "HH:mm aa".
 */
const getTimeStringFromDate = (date?: Date, endDate?: boolean): string => {
	if (!date) {
		return endDate ? '11:59pm' : '12:00 AM'
	}

	return moment(date).format(TIME_DISPLAY_FORMAT)
}

/**
 * Format date	to be displayed in the input.
 * @param date {Date}
 * @returns {string}
 */
const formatDisplayedDate = (date?: Date) => {
	if (!date) {
		return ''
	}
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}

export const getLabel = ({
	selectedValue,
	presets,
}: {
	selectedValue: SelectedValue
	presets: Preset[]
}) => {
	const foundPreset = presets.find((preset) => {
		return isPresetSelected(preset, selectedValue.selectedPreset)
	})

	if (foundPreset) {
		return presetLabel(foundPreset)
	}

	const { startDate, endDate } = selectedValue

	if (startDate && endDate) {
		const showYear = endDate.getFullYear() > startDate.getFullYear()

		return `${toDateTimeString(startDate, showYear)} - ${toDateTimeString(
			endDate,
			showYear,
		)}`
	}

	return ''
}

type SelectedValue = {
	startDate?: Date
	endDate?: Date
	selectedPreset?: Preset
}

type Props = {
	selectedValue: SelectedValue
	onDatesChange: (startDate?: Date, endDate?: Date, presetId?: Preset) => void
	presets: Preset[]
	minDate: Date
	noCustom?: boolean
} & Omit<MenuButtonProps, 'ref' | 'store'>

export const PreviousDateRangePicker: React.FC<Props> = (props) => (
	<Menu placement="bottom-end">
		{/* Rendering inside wrapper so we can work with menu store via useMenu. */}
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
	selectedValue,
	onDatesChange,
	presets,
	noCustom,
	minDate,
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
		getLabel({ selectedValue, presets }),
	)

	const handleShowingTimeToggle = () => {
		setShowingTime((prevShowingTime) => !prevShowingTime)
	}

	const handleDatesChange = ({
		startDate,
		endDate,
		selectedPreset,
	}: SelectedValue) => {
		onDatesChange(startDate, endDate, selectedPreset)

		if (startDate && endDate) {
			menu.setOpen(false)
			setMenuState(MenuState.Default)
		}
	}

	const handleStartDateInput = (value: string) => {
		const isValidDateInput = [
			DATE_INPUT_FORMAT_WITH_SLASH,
			DATE_INPUT_FORMAT_WITH_DASH,
			DATE_INPUT_FORMAT_WITH_DOT,
			DATE_INPUT_FORMAT_WITH_COMMA,
			DATE_INPUT_FORMAT_WITH_NO_COMMA,
			DATE_INPUT_FORMAT_WITH_SINGLE_DAY_AND_NO_COMMA,
			DATE_INPUT_FORMAT_WITH_SINGLE_DAY,
		].some((format) => moment(value, format, true).isValid())

		if (isValidDateInput) {
			const newDate = moment(value).toDate()
			onDatesChange(newDate, selectedValue.endDate, undefined)
		}
	}

	const handleEndDateInput = (value: string) => {
		const isValidDateInput = [
			DATE_INPUT_FORMAT_WITH_SLASH,
			DATE_INPUT_FORMAT_WITH_DASH,
			DATE_INPUT_FORMAT_WITH_DOT,
			DATE_INPUT_FORMAT_WITH_COMMA,
			DATE_INPUT_FORMAT_WITH_NO_COMMA,
			DATE_INPUT_FORMAT_WITH_SINGLE_DAY_AND_NO_COMMA,
			DATE_INPUT_FORMAT_WITH_SINGLE_DAY,
		]
			.map((format) => moment(value, format, true).isValid())
			.some((isValid) => isValid)

		if (isValidDateInput) {
			const newDate = moment(value).toDate()
			onDatesChange(selectedValue.startDate, newDate, undefined)
		}
	}

	const handleTimeChange = (value: string, input: 'start' | 'end') => {
		const isValid = [
			TIME_INPUT_FORMAT,
			TIME_INPUT_FORMAT_NO_SPACE,
			TIME_INPUT_FORMAT_12_HOUR,
			TIME_INPUT_FORMAT_12_HOUR_NO_SPACE,
			TIME_INPUT_FORMAT_HOURS_NO_MINUTES,
			TIME_INPUT_FORMAT_HOURS_NO_MINUTES_NO_SPACE,
			TIME_INPUT_FORMAT_HOURS_NO_MINUTES_NO_AM_PM,
			TIME_INPUT_FORMAT_HOURS_NO_MINUTES_NO_AM_PM_24_HOUR,
			TIME_INPUT_FORMAT_24_HOURS_MINUTES_NO_AM_PM_24,
			TIME_INPUT_FORMAT_12_HOURS_NO_AM_PM,
		]
			.map((format) => moment(value, format, true).isValid())
			.some((isValid) => isValid)

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
		if (selectedValue.startDate && selectedValue.endDate) {
			setButtonLabel(getLabel({ selectedValue, presets }))
		}
	}, [selectedValue.startDate?.getTime(), selectedValue.endDate?.getTime()])

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

	const handleAbsoluteDateChange = (selectedDates: Date[]) =>
		handleDatesChange({
			startDate: selectedDates[0],
			endDate: selectedDates[1],
		})

	const handlePresetSelected = (preset: Preset) => {
		handleDatesChange({
			selectedPreset: preset,
		})
	}

	return (
		<DatePickerStateProvider
			// TODO(spenny): check this config / maybe calc dates based on preset
			config={{
				selectedDates: [
					selectedValue.startDate || new Date(),
					selectedValue.endDate || new Date(),
				],
				onDatesChange: handleAbsoluteDateChange,
				dates: { mode: 'range', minDate, maxDate: new Date() },
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
