import SvgCalendarIcon from '@icons/CalendarIcon'
import { DatePicker } from 'antd'
import moment from 'moment'

import inputStyles from './InputStyles.module.css'

const { RangePicker } = DatePicker

interface DateInputProps {
	startDate: Date | undefined
	endDate: Date | undefined
	onChange: (startDate: Date | undefined, endDate: Date | undefined) => void
}

export const DateInput = ({ startDate, endDate, onChange }: DateInputProps) => {
	return (
		<div>
			<RangePicker
				autoFocus
				defaultOpen
				showTime
				ranges={{
					Today: [moment().startOf('day'), moment().endOf('day')],
					'This Week': [
						moment().startOf('week'),
						moment().endOf('week'),
					],
					'This Month': [
						moment().startOf('month'),
						moment().endOf('month'),
					],
				}}
				value={[moment(startDate), moment(endDate)]}
				suffixIcon={<SvgCalendarIcon height="16px" width="16px" />}
				className={inputStyles.datePicker}
				onChange={(_date: any, dateStrings: [string, string]) => {
					// Dates in local timezone.
					const start_date = dateStrings[0]
						? moment(dateStrings[0])
						: undefined
					const end_date = dateStrings[1]
						? moment(dateStrings[1])
						: undefined
					onChange(start_date?.toDate(), end_date?.toDate())
				}}
			/>
		</div>
	)
}
