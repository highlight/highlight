import React from 'react'
import { Box } from '../../Box/Box'
import { Stack } from '../../Stack/Stack'
import { Text } from '../../Text/Text'
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
		<Box backgroundColor="white" p="10">
			<Stack direction="row" align="center">
				{prevButton}

				<Box flexGrow={1}>
					<Text userSelect="none" align="center">
						{month} {year}
					</Text>
				</Box>
				{nextButton}
			</Stack>

			<div className={styles.weekDays}>
				{weekDays.map((d) => (
					<Text align="center" key={d} userSelect="none">
						{d}
					</Text>
				))}
			</div>
			<main className={styles.days}>
				{days.map((d) => (
					<Day day={d} key={d.$date.toString()}>
						<Text userSelect="none" align="center">
							{d.day}
						</Text>
					</Day>
				))}
			</main>
		</Box>
	)
}
