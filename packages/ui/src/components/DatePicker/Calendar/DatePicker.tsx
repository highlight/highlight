import {
	useContextCalendars,
	useContextDatePickerOffsetPropGetters,
} from '@rehookify/datepicker'

import { Box } from '../../Box/Box'
import { IconSolidCheveronLeft } from '../../icons/IconSolidCheveronLeft'
import { IconSolidCheveronRight } from '../../icons/IconSolidCheveronRight'
import { Calendar } from './Calendar'
import * as styles from './styles.css'

const DatePicker = ({ hasSelectedRange }: { hasSelectedRange?: boolean }) => {
	const { calendars } = useContextCalendars()
	const { addOffset, subtractOffset } =
		useContextDatePickerOffsetPropGetters()

	return (
		<Calendar
			hasSelectedRange={hasSelectedRange}
			prevButton={
				<Box
					cursor="pointer"
					{...subtractOffset({ months: 1 })}
					cssClass={styles.monthButton}
				>
					<IconSolidCheveronLeft />
				</Box>
			}
			nextButton={
				<Box
					cursor="pointer"
					{...addOffset({ months: 1 })}
					cssClass={styles.monthButton}
				>
					<IconSolidCheveronRight />
				</Box>
			}
			calendar={calendars[0]}
		/>
	)
}

export { DatePicker }
