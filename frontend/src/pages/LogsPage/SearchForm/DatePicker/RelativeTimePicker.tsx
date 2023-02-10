import { Menu, Popover } from '@highlight-run/ui'
import { DatePicker } from '@pages/LogsPage/SearchForm/DatePicker/DatePicker'
import { DatePickerStateProvider } from '@rehookify/datepicker'
import moment from 'moment'
import { useState } from 'react'

interface Props {
	initialStartDate: Date
	initialEndDate: Date
	onDatesSelected: (startDate: Date, endDate: Date) => void
}

const DATE_OPTIONS = [
	{ label: 'Last 5 minutes' },
	{ label: 'Last 15 minutes' },
	{ label: 'Last 1 hours' },
	{ label: 'Last 6 hours' },
	{ label: 'Last 24 hours' },
	{ label: 'Last 7 days' },
	{ label: 'Last 30 days' },
]

const RelativeTimePicker = ({
	initialStartDate,
	initialEndDate,
	onDatesSelected,
}: Props) => {
	const [showCustom, setShowCustom] = useState(false)
	const [selectedDates, setSelectedDates] = useState<Date[]>([
		initialStartDate,
		initialEndDate,
	])

	const handleDatesChange = (newDates: Date[]) => {
		setSelectedDates(newDates)
		if (newDates.length == 2) {
			onDatesSelected(
				newDates[0],
				moment(newDates[1]).endOf('day').toDate(),
			)
			setShowCustom(false)
		}
	}

	if (showCustom) {
		return (
			<Popover open={true}>
				<Popover.ButtonTrigger kind="secondary">
					Last 30 days
				</Popover.ButtonTrigger>
				<Popover.Content>
					<DatePickerStateProvider
						config={{
							selectedDates,
							onDatesChange: handleDatesChange,
							dates: {
								mode: 'range',
								maxDate: new Date(),
							},
						}}
					>
						<DatePicker />
					</DatePickerStateProvider>
				</Popover.Content>
			</Popover>
		)
	}

	return (
		<Menu>
			<Menu.Button kind="secondary">Last 30 days</Menu.Button>
			<Menu.List>
				{DATE_OPTIONS.map((option) => {
					return (
						<Menu.Item key={option.label}>{option.label}</Menu.Item>
					)
				})}
				<Menu.Item onClick={() => setShowCustom(true)}>
					Custom
				</Menu.Item>
			</Menu.List>
		</Menu>
	)
}

export { RelativeTimePicker }
