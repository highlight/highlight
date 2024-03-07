import { DatePickerStateProvider } from '@rehookify/datepicker'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'

import { colors } from '../../css/colors'
import { Box } from '../Box/Box'
import { Form } from '../Form/Form'
import {
	IconSolidCheck,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidClock,
} from '../icons'
import { Menu, MenuButtonProps } from '../Menu/Menu'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import { DatePicker } from './Calendar/DatePicker'
import { DateInput } from './DateInput'
import { TimeInput } from './TimeInput'

export { defaultPresets, getNow, resetRelativeDates } from './utils'

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

const now = new Date()

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
const getTimeStringFromDate = (date: Date): string => {
	if (!date) {
		return '12:00 AM'
	}

	return moment(date).format(TIME_DISPLAY_FORMAT)
}

/**
 * Format date	to be displayed in the input.
 * @param date {Date}
 * @returns {string}
 */
const formatDisplayedDate = (date: Date) => {
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

	if (selectedDates.length == 2 && selectedDates[1] && selectedDates[0]) {
		const showYear =
			selectedDates[1].getFullYear() > selectedDates[0].getFullYear()

		return `${toDateTimeString(
			selectedDates[0],
			showYear,
		)} - ${toDateTimeString(selectedDates[1], showYear)}`
	}

	return ''
}

type Props = {
	selectedDates: Date[]
	onDatesChange: (selectedDates: Date[]) => void
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
	selectedDates,
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

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const menu = Menu.useContext()!
	const open = menu.getState().open

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
		() => formatDisplayedDate(selectedDates[0]),
		[selectedDates[0]],
	)

	const endDatePlaceholder = useMemo(
		() => formatDisplayedDate(selectedDates[1]),
		[selectedDates[1]],
	)

	const startTimePlaceholder = useMemo(
		() => getTimeStringFromDate(selectedDates[0]),
		[selectedDates[0]],
	)

	const endTimePlaceholder = useMemo(
		() => getTimeStringFromDate(selectedDates[1]),
		[selectedDates[1]],
	)

	const isTimepickerDisabled = useMemo(
		() => selectedDates.length != 2,
		[selectedDates],
	)

	const [buttonLabel, setButtonLabel] = useState<string>(
		getLabel({ selectedDates, presets }),
	)

	const handleShowingTimeToggle = () => {
		setShowingTime((prevShowingTime) => !prevShowingTime)
	}

	const handleDatesChange = (dates: Date[]) => {
		onDatesChange(dates)

		if (dates.length == 2) {
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
			const newDates = [newDate, selectedDates[1]]

			onDatesChange(newDates)
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
			const newDates = [selectedDates[0], newDate]

			onDatesChange(newDates)
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

			if (!isValid) {
				return
			}

			const timeInfo = getTimeInfo(value)
			const startDate = setTimeOnDate(
				selectedDates[0],
				timeInfo.hour24,
				timeInfo.minute,
			)

			onDatesChange([startDate, selectedDates[1]])

			return
		}

		setEndTimeIsValid(isValid)

		if (!isValid) {
			return
		}

		const timeInfo = getTimeInfo(value)

		const endDate = setTimeOnDate(
			selectedDates[1],
			timeInfo.hour24,
			timeInfo.minute,
		)

		onDatesChange([selectedDates[0], endDate])
	}

	useEffect(() => {
		if (selectedDates.length == 2) {
			setButtonLabel(getLabel({ selectedDates, presets }))
		}
	}, [selectedDates[0]?.getTime(), selectedDates[1]?.getTime()])

	const hasSelectedRange = useMemo(
		() =>
			selectedDates.length === 2 &&
			selectedDates.filter((date) => moment(date).isValid()).length === 2,
		[selectedDates],
	)

	const handleAbsoluteDateChange = (selectedDates: Date[]) => {
		let startDate = selectedDates?.[0]
		let endDate = selectedDates?.[1]
		if (startDate) {
			startDate = moment
				.max(moment(startDate).startOf('day'), moment(minDate))
				.toDate()
		}
		if (endDate) {
			endDate = moment
				.min(moment(endDate).endOf('day'), moment())
				.toDate()
		}

		const newDates = [startDate, endDate].filter((date) => !!date)
		handleDatesChange(newDates)
	}

	return (
		<DatePickerStateProvider
			config={{
				selectedDates,
				onDatesChange: handleAbsoluteDateChange,
				dates: {
					mode: 'range',
					minDate,
					maxDate: new Date(),
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
										py="2"
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
												selectedDates,
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
					<Form>
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
