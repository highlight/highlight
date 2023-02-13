import { Box } from '@highlight-run/ui'
import SvgChevronRightIcon from '@icons/ChevronRightIcon'
import { ChevronLeftIcon } from '@icons/index'
import { Calendar } from '@pages/LogsPage/SearchForm/DatePicker/Calendar/Calendar'
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
		<main>
			<Calendar
				prevButton={
					previousMonthButtonProps.disabled ? (
						<div />
					) : (
						<Box {...previousMonthButtonProps} cursor="pointer">
							<ChevronLeftIcon />
						</Box>
					)
				}
				nextButton={
					nextMonthButtonProps.disabled ? (
						<div />
					) : (
						<Box {...nextMonthButtonProps} cursor="pointer">
							<SvgChevronRightIcon />
						</Box>
					)
				}
				calendar={calendars[0]}
			/>
		</main>
	)
}

export { DatePicker }
