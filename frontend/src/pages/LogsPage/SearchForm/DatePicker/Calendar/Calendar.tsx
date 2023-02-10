import { Box, Stack, Text } from '@highlight-run/ui'
import { Day } from '@pages/LogsPage/SearchForm/DatePicker/Calendar/Day'
import {
	Calendar as CalendarType,
	useContextCalendars,
} from '@rehookify/datepicker'
import { FC, ReactNode } from 'react'

import { getDayClassName } from '../utils'

interface CalendarProps {
	prevButton?: ReactNode
	nextButton?: ReactNode
	calendar: CalendarType
}

export const Calendar: FC<CalendarProps> = ({
	prevButton,
	nextButton,
	calendar,
}) => {
	const { weekDays } = useContextCalendars()
	const { days, month, year } = calendar

	return (
		<section className="w-56 bg-white">
			<Stack direction="row" align="center">
				{prevButton || <div />}

				<Box flexGrow={1}>
					<Text align="center">
						{month} {year}
					</Text>
				</Box>
				{nextButton || <div />}
			</Stack>
			<div className="grid h-8 grid-cols-7 items-center gap-y-2">
				{weekDays.map((d) => (
					<Text align="center" key={d}>
						{d}
					</Text>
				))}
			</div>
			<main className="grid grid-cols-7 gap-y-2">
				{days.map((d) => (
					<Day
						day={d}
						key={d.$date.toString()}
						className={getDayClassName('w-8 text-xs', d)}
					>
						<Text align="center">{d.day}</Text>
					</Day>
				))}
			</main>
		</section>
	)
}
