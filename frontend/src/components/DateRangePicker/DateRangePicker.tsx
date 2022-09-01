import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

import Button from '@components/Button/Button/Button'
import Popover from '@components/Popover/Popover'
import SvgChevronDownIcon from '@icons/ChevronDownIcon'
import moment from 'moment'
import React, { useState } from 'react'
import { DateRangePicker as ReactDateRange, Range } from 'react-date-range'

import styles from './DateRangePicker.module.scss'

type Props = {
	onChange: (startDate?: Date, endDate?: Date) => void
}

const TIME_RANGES = [
	{ label: 'Last 24 hours', value: 2 },
	{ label: 'Last 7 days', value: 7 },
	{ label: 'Last month', value: 30 },
	{ label: 'Last 3 months', value: 30 * 3 },
	{ label: 'Last 6 months', value: 30 * 6 },
	{ label: 'This year', value: 30 * 12 },
] as const

const DateRangePicker = ({ onChange }: Props) => {
	const [state, setState] = useState<Range[]>([
		{
			startDate: new Date(),
			endDate: moment().endOf('week').toDate(),
			key: 'selection',
		},
	])
	const [buttonLabel, setButtonLabel] = useState('Last 7 days')

	return (
		<div>
			<Popover
				trigger={['click']}
				placement="bottomRight"
				popoverClassName={styles.popover}
				content={
					<ReactDateRange
						rangeColors={[
							'var(--color-purple-700)',
							'#3ecf8e',
							'#fed14c',
						]}
						onChange={(item) => {
							if (onChange) {
								onChange(
									item.selection.startDate,
									item.selection.endDate,
								)
							}
							setState([item.selection])
							setButtonLabel(
								getButtonLabel(
									item.selection.startDate,
									item.selection.endDate,
								),
							)
						}}
						months={2}
						staticRanges={TIME_RANGES.map((timeRange) => {
							const { endDate, startDate } =
								getStartAndEndTimeRange(timeRange.value)

							return {
								isSelected: (range) => {
									return (
										areDatesEqual(
											range.startDate,
											startDate,
										) &&
										areDatesEqual(range.endDate, endDate)
									)
								},
								label: timeRange.label,
								range: () => ({ startDate, endDate }),
							}
						})}
						className={styles.dateRange}
						ranges={state}
						direction="horizontal"
						inputRanges={[]}
					/>
				}
			>
				<Button
					trackingId="DateRangePicker"
					className={styles.button}
					type="ghost"
				>
					{buttonLabel} <SvgChevronDownIcon />
				</Button>
			</Popover>
		</div>
	)
}

export default DateRangePicker

/**
 * Checks to see if the 2 dates are on the same day. Ignores the time.
 */
const areDatesEqual = (a?: Date, b?: Date): boolean => {
	if (!a || !b) {
		return false
	}

	const [aDate] = a.toISOString().split('T')
	const [bDate] = b.toISOString().split('T')

	return aDate === bDate
}

const getButtonLabel = (_startDate?: Date, _endDate?: Date): string => {
	if (!_startDate || !_endDate) {
		return 'Date Range'
	}

	const startDate = moment(_startDate)
	const endDate = moment(_endDate)
	const DATE_FORMAT = 'DD MMM'

	const matchingPreset = TIME_RANGES.find((timeRange) => {
		const { endDate: presetEndDate, startDate: presetStartDate } =
			getStartAndEndTimeRange(timeRange.value)

		return (
			areDatesEqual(startDate.toDate(), presetStartDate) &&
			areDatesEqual(endDate.toDate(), presetEndDate)
		)
	})

	if (matchingPreset) {
		return matchingPreset.label
	}

	return `${endDate.format(DATE_FORMAT)} - ${startDate.format(DATE_FORMAT)}`
}

const getStartAndEndTimeRange = (
	daysBefore: number,
): { startDate: Date; endDate: Date } => {
	const startDate = moment().toDate()
	const endDate = moment().subtract(daysBefore, 'days').toDate()

	return {
		startDate,
		endDate,
	}
}
