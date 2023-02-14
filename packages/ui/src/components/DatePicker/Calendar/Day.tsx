import React from 'react'
import { Box } from '@highlight-run/ui'
import { CalendarDay, useContextDaysPropGetters } from '@rehookify/datepicker'
import { ReactNode } from 'react'

const getColor = (day: CalendarDay) => {
	const { selected, disabled } = day

	if (disabled) {
		return 'weak'
	}

	if (selected) {
		return 'white'
	}

	return 'inherit'
}

const getBackgroundColor = (day: CalendarDay) => {
	const { selected, range } = day

	if (selected) {
		return 'p9'
	}

	if (range == 'in-range') {
		return 'p7'
	}

	return 'inherit'
}

const getBorderRight = (day: CalendarDay) => {
	const { range } = day

	if (range == 'will-be-range-end') {
		return 'secondaryHover'
	}

	return 'none'
}

const getBorderLeft = (day: CalendarDay) => {
	const { range } = day

	if (range == 'will-be-range-start') {
		return 'secondaryHover'
	}

	return 'none'
}

const getBorderTopBottom = (day: CalendarDay) => {
	const { range } = day

	if (
		range == 'will-be-in-range' ||
		range == 'will-be-range-start' ||
		range == 'will-be-range-end'
	) {
		return 'secondaryHover'
	}

	return 'none'
}

const getBorderLeftRadius = (day: CalendarDay) => {
	const { range } = day

	if (range == 'range-start') {
		return '6'
	}

	return 'inherit'
}

const getBorderRightRadius = (day: CalendarDay) => {
	const { range } = day

	if (range == 'range-end') {
		return '6'
	}

	return 'inherit'
}

const getPointer = (day: CalendarDay) => {
	const { disabled } = day

	return disabled ? 'default' : 'pointer'
}

interface Props {
	children: ReactNode
	day: CalendarDay
}

const Day = ({ children, day }: Props) => {
	const { dayButton } = useContextDaysPropGetters()

	return (
		<Box
			{...dayButton(day)}
			cursor={getPointer(day)}
			color={getColor(day)}
			padding="10"
			backgroundColor={getBackgroundColor(day)}
			borderTop={getBorderTopBottom(day)}
			borderBottom={getBorderTopBottom(day)}
			borderLeft={getBorderLeft(day)}
			borderRight={getBorderRight(day)}
			borderTopLeftRadius={getBorderLeftRadius(day)}
			borderBottomLeftRadius={getBorderLeftRadius(day)}
			borderTopRightRadius={getBorderRightRadius(day)}
			borderBottomRightRadius={getBorderRightRadius(day)}
		>
			{children}
		</Box>
	)
}

export { Day }
