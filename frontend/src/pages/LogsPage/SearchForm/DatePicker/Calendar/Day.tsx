import { Box } from '@highlight-run/ui'
import { CalendarDay, useContextDaysPropGetters } from '@rehookify/datepicker'
import { ReactNode } from 'react'

const getColor = (day: CalendarDay) => {
	const { selected, disabled, inCurrentMonth, now, range } = day

	if (disabled) {
		return 'weak'
	}

	if (now) {
		return 'inherit'
	}

	if (selected) {
		return 'white'
	}

	return 'inherit'
}

const getBackgroundColor = (day: CalendarDay) => {
	const { selected, disabled, inCurrentMonth, now, range } = day

	if (selected) {
		return 'p9'
	}

	if (range == 'in-range') {
		return 'p7'
	}

	return 'inherit'
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

const getPadding = (day: CalendarDay) => {
	const { now } = day

	return now ? '10' : '10'
}

interface NowProps {
	children: any
}

const NowBox = ({ children }: NowProps) => {
	return (
		<Box backgroundColor="g4" borderRadius="round">
			{children}
		</Box>
	)
}

interface Props {
	className?: string
	children: ReactNode
	day: CalendarDay
}

const Day = ({ children, day }: Props) => {
	const { dayButton } = useContextDaysPropGetters()
	const { now } = day

	return (
		<Box
			{...dayButton(day)}
			cursor={getPointer(day)}
			color={getColor(day)}
			padding={getPadding(day)}
			backgroundColor={getBackgroundColor(day)}
			borderTopLeftRadius={getBorderLeftRadius(day)}
			borderBottomLeftRadius={getBorderLeftRadius(day)}
			borderTopRightRadius={getBorderRightRadius(day)}
			borderBottomRightRadius={getBorderRightRadius(day)}
		>
			{now ? <NowBox>{children}</NowBox> : <>{children}</>}
		</Box>
	)
}

export { Day }
