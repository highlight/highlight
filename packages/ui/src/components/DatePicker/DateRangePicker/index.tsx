import { useMenuContext } from '@ariakit/react'
import { DatePickerStateProvider } from '@rehookify/datepicker'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'

import { Box } from '../../Box/Box'
import { Form } from '../../Form/Form'
import {
	IconSolidCheck,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidClock,
} from '../../icons'
import { Menu, MenuButtonProps } from '../../Menu/Menu'
import { Stack } from '../../Stack/Stack'
import { Text } from '../../Text/Text'
import { DatePicker } from '../Calendar/DatePicker'
import { DateInput } from '../DateInput'
import { TimeInput } from '../TimeInput'
import { VALID_DATE_INPUT_FORMATS, VALID_TIME_INPUT_FORMATS } from './constants'
import {
	formatDisplayedDate,
	getInputLabel,
	getTimeInfo,
	getTimeStringFromDate,
	isCustomSelected,
	isPresetSelected,
	setTimeOnDate,
} from './helpers'
import { Badge } from '../../Badge/Badge'

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
	startDate: Date
	endDate: Date
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

export const EXTENDED_TIME_PRESETS: DateRangePreset[] =
	DEFAULT_TIME_PRESETS.concat({
		unit: 'months',
		quantity: 3,
	})

export const presetLabel = (preset: DateRangePreset) => {
	return preset.label || `Last ${preset.quantity} ${preset.unit}`
}

export const presetValue = (preset: DateRangePreset) => {
	return preset.value || `last_${preset.quantity}_${preset.unit}`
}

export const parsePreset = (presetValue: string): DateRangePreset => {
	const [, quantity, unit] = presetValue.split('_')
	return {
		quantity: Number(quantity),
		unit: unit as moment.DurationInputArg2,
	}
}

export const presetStartDate = (preset: DateRangePreset): Date => {
	return moment().subtract(preset.quantity, preset.unit).toDate()
}

type Props = {
	selectedValue: DateRangeValue
	onDatesChange: (
		startDate: Date,
		endDate: Date,
		preset?: DateRangePreset,
	) => void
	presets: DateRangePreset[]
	minDate: Date
	maxDate?: Date
	noCustom?: boolean
	defaultPreset?: DateRangePreset
	setDefaultPreset?: (preset: DateRangePreset) => void
} & Omit<MenuButtonProps, 'ref' | 'store'>

export const DateRangePicker: React.FC<Props> = (props) => {
	const [open, setOpen] = useState(false)
	return (
		<Menu open={open} setOpen={setOpen} placement="bottom-end">
			{/* Rendering inside wrapper so we can work with menu store via useMenu. */}
			<DateRangePickerImpl {...props} open={open} />
		</Menu>
	)
}

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
	defaultPreset,
	setDefaultPreset,
	minDate,
	maxDate = moment().toDate(),
	open,
	...props
}: Props & { open: boolean }) => {
	const [menuState, setMenuState] = React.useState<MenuState>(
		MenuState.Default,
	)
	const [startDateIsValid, setStartDateIsValid] = useState<boolean>(true)
	const [endDateIsValid, setEndDateIsValid] = useState<boolean>(true)
	const [startTimeIsValid, setStartTimeIsValid] = useState<boolean>(true)
	const [endTimeIsValid, setEndTimeIsValid] = useState<boolean>(true)
	const useAbsoluteTime = !selectedValue.selectedPreset
	const [absoluteDateRange, setAbsoluteDateRange] = useState<Date[]>(
		useAbsoluteTime ? [selectedValue.startDate, selectedValue.endDate] : [],
	)

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const menu = useMenuContext()!

	useEffect(() => {
		if (!open) {
			setMenuState(MenuState.Default)
		}
	}, [open])

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

	const [buttonLabel, setButtonLabel] = useState<string>(
		getInputLabel({ selectedValue, presets }),
	)

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
		const validDateFormat = VALID_DATE_INPUT_FORMATS.find((format) =>
			moment(value, format, true).isValid(),
		)

		setStartDateIsValid(!!validDateFormat)
		if (validDateFormat) {
			const newDate = moment(value, validDateFormat).toDate()
			const startDate = setTimeOnDate(
				newDate,
				selectedValue.startDate.getHours(),
				selectedValue.startDate.getMinutes(),
			)

			onDatesChange(startDate, selectedValue.endDate, undefined)
		}
	}

	const handleEndDateInput = (value: string) => {
		const validDateFormat = VALID_DATE_INPUT_FORMATS.find((format) =>
			moment(value, format, true).isValid(),
		)

		setEndDateIsValid(!!validDateFormat)
		if (validDateFormat) {
			const newDate = moment(value, validDateFormat).toDate()
			const endDate = setTimeOnDate(
				newDate,
				selectedValue.endDate.getHours(),
				selectedValue.endDate.getMinutes(),
			)

			onDatesChange(selectedValue.startDate, endDate, undefined)
		}
	}

	const handleStartTimeChange = (value: string) => {
		const isValidTimeInput = VALID_TIME_INPUT_FORMATS.map((format) =>
			moment(value, format, true).isValid(),
		).some((isValid) => isValid)

		setStartTimeIsValid(isValidTimeInput)
		if (isValidTimeInput && !!selectedValue.startDate) {
			const timeInfo = getTimeInfo(value)
			const startDate = setTimeOnDate(
				selectedValue.startDate,
				timeInfo.hour24,
				timeInfo.minute,
			)

			onDatesChange(startDate, selectedValue.endDate, undefined)
		}
	}

	const handleEndTimeChange = (value: string) => {
		const isValidTimeInput = VALID_TIME_INPUT_FORMATS.map((format) =>
			moment(value, format, true).isValid(),
		).some((isValid) => isValid)

		setEndTimeIsValid(isValidTimeInput)
		if (isValidTimeInput && !!selectedValue.endDate) {
			const timeInfo = getTimeInfo(value)

			const endDate = setTimeOnDate(
				selectedValue.endDate,
				timeInfo.hour24,
				timeInfo.minute,
			)

			onDatesChange(selectedValue.startDate, endDate, undefined)
		}
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

		// only update to parent when both are selected
		if (startDate && endDate) {
			handleDatesChange({ startDate, endDate })
		}

		const newDates = [startDate, endDate].filter((date) => !!date)
		setAbsoluteDateRange(newDates)
	}

	const handlePresetSelected = (preset: DateRangePreset) => {
		const end = moment().toDate()
		const start = presetStartDate(preset)

		handleDatesChange({
			startDate: start,
			endDate: end,
			selectedPreset: preset,
		})
	}

	const validStartDateTime = startDateIsValid && startTimeIsValid
	const validEndDateTime = endDateIsValid && endTimeIsValid

	return (
		<DatePickerStateProvider
			config={{
				selectedDates: absoluteDateRange,
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
				{menuState === MenuState.Default && (
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
						{defaultPreset && setDefaultPreset && (
							<>
								<Menu.Divider />
								<Menu>
									<Menu.Button render={<Menu.Item />}>
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
												<IconSolidClock size={16} />
												<Text userSelect="none">
													Default
												</Text>
												<Badge
													label={`${defaultPreset.quantity} ${defaultPreset.unit}`}
												/>
											</Stack>
											<IconSolidCheveronRight size={16} />
										</Stack>
									</Menu.Button>
									<Menu.List>
										{presetOptions.map((preset) => {
											return (
												<Menu.Item
													key={preset.label}
													onClick={(e) => {
														e.preventDefault()
														e.stopPropagation()
														setDefaultPreset(preset)
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
																defaultPreset,
															)}
														/>
														<Text userSelect="none">
															{`${preset.quantity} ${preset.unit}`}
														</Text>
													</Stack>
												</Menu.Item>
											)
										})}
									</Menu.List>
								</Menu>
							</>
						)}
					</>
				)}
				{menuState === MenuState.Custom && (
					<Form>
						<Box
							borderBottom={'divider'}
							pb={'4'}
							px={'4'}
							display={'flex'}
							gap={'4'}
						>
							<Box
								style={{ width: 130 }}
								border={
									validStartDateTime ? 'secondary' : 'error'
								}
								borderRadius="6"
							>
								<Box
									borderBottom={
										validStartDateTime
											? 'secondary'
											: 'error'
									}
								>
									<DateInput
										name="startDate"
										placeholder={
											startDatePlaceholder || 'Start date'
										}
										onDateChange={handleStartDateInput}
									/>
								</Box>
								<Box>
									<TimeInput
										name="startTime"
										placeholder={startTimePlaceholder}
										onTimeChange={handleStartTimeChange}
									/>
								</Box>
							</Box>
							<Box
								style={{ width: 130 }}
								border={
									validEndDateTime ? 'secondary' : 'error'
								}
								borderRadius="6"
							>
								<Box
									borderBottom={
										validEndDateTime ? 'secondary' : 'error'
									}
								>
									<DateInput
										name="endDate"
										placeholder={
											endDatePlaceholder || 'End date'
										}
										onDateChange={handleEndDateInput}
									/>
								</Box>
								<Box>
									<TimeInput
										name="endTime"
										placeholder={endTimePlaceholder}
										onTimeChange={handleEndTimeChange}
									/>
								</Box>
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
