import React from 'react'
import { Box } from '../../Box/Box'
import { IconSolidCheveronLeft } from '../../icons/IconSolidCheveronLeft'
import { IconSolidCheveronRight } from '../../icons/IconSolidCheveronRight'

import { Calendar } from './Calendar'
import {
	useContextCalendars,
	useContextMonthsPropGetters,
} from '@rehookify/datepicker'

const DatePicker = () => {
	const { calendars } = useContextCalendars()
	const { previousMonthButton, nextMonthButton } =
		useContextMonthsPropGetters()

	const previousMonthButtonProps = previousMonthButton()
	const nextMonthButtonProps = nextMonthButton()

	return (
		<Calendar
			prevButton={
				previousMonthButtonProps.disabled ? (
					<div />
				) : (
					<Box {...previousMonthButtonProps} cursor="pointer">
						<IconSolidCheveronLeft />
					</Box>
				)
			}
			nextButton={
				nextMonthButtonProps.disabled ? (
					<div />
				) : (
					<Box {...nextMonthButtonProps} cursor="pointer">
						<IconSolidCheveronRight />
					</Box>
				)
			}
			calendar={calendars[0]}
		/>
	)
}

export { DatePicker }
