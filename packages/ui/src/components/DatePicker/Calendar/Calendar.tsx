import React from 'react'
import { Box, Stack, Text } from '@highlight-run/ui'
import { Day } from './Day'
import {
	Calendar as CalendarType,
	useContextCalendars,
} from '@rehookify/datepicker'
import { FC, ReactNode } from 'react'

import * as styles from './styles.css'

interface CalendarProps {
	prevButton: ReactNode
	nextButton: ReactNode
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
		<Box backgroundColor="white">
			<Stack direction="row" align="center">
				{prevButton}

				<Box flexGrow={1}>
					<Text align="center">
						{month} {year}
					</Text>
				</Box>
				{nextButton}
			</Stack>

			<div className={styles.weekDays}>
				{weekDays.map((d) => (
					<Text align="center" key={d}>
						{d}
					</Text>
				))}
			</div>
			<main className={styles.days}>
				{days.map((d) => (
					<Day day={d} key={d.$date.toString()}>
						<Text align="center">{d.day}</Text>
					</Day>
				))}
			</main>
		</Box>
	)
}
