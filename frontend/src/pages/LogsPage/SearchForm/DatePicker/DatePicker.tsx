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

	return (
		<main>
			<Calendar
				prevButton={
					<Box {...previousMonthButton()} cursor="pointer">
						<ChevronLeftIcon />
					</Box>
				}
				nextButton={
					<Box {...nextMonthButton()} cursor="pointer">
						<SvgChevronRightIcon />
					</Box>
				}
				calendar={calendars[0]}
			/>
		</main>
	)
}

export { DatePicker }
