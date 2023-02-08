import useDataTimeRange, { DataTimeRange } from '@hooks/useDataTimeRange'
import { DatePicker } from 'antd'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

const { RangePicker } = DatePicker

import styles from './TimeRangePicker.module.scss'

export const DATE_OPTIONS = [
	{ offset: 5, label: 'Last 5 minutes' },
	{ offset: 15, label: 'Last 15 minutes' },
	{ offset: 60, label: 'Last 1 hours' },
	{ offset: 360, label: 'Last 6 hours' },
	{ offset: 1440, label: 'Last 24 hours' },
	{ offset: 10080, label: 'Last 7 days' },
	{ offset: 43200, label: 'Last 30 days' },
]

const UNITS = [
	'm',
	'minute',
	'minutes',
	'h',
	'hour',
	'hours',
	'd',
	'day',
	'days',
	'w',
	'week',
	'weeks',
	'm',
	'month',
	'months',
]

const DATE_FORMAT = 'DD MMM h:mm A'

const TimeRangePicker: React.FC<React.PropsWithChildren<unknown>> = () => {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const [open, setOpen] = useState(false)
	const [datepickerPanelOpen, setDatepickerPanelOpen] = useState(false)
	const [customDateRange, setCustomDateRange] = useState('')
	const { timeRange, setTimeRange } = useDataTimeRange()

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as HTMLElement)
			) {
				setOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [containerRef])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setOpen(false)
			}
		}

		if (open) {
			document.addEventListener('keydown', handleKeyDown)
		} else {
			setDatepickerPanelOpen(false)
		}

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [open])

	useHotkeys(
		't',
		(e) => {
			e.preventDefault()
			setOpen(!open)
		},
		[],
	)

	const label = buildDateRangeLabel(timeRange)

	return (
		<div
			className={clsx(styles.container, { [styles.open]: open })}
			ref={containerRef}
		>
			<div
				className={styles.labelContainer}
				onClick={() => setOpen(!open)}
			>
				<span className={styles.label}>{label}</span>
				<span className={styles.hotkeyHelp}>
					<pre>t</pre>
				</span>
			</div>

			{open && (
				<div className={clsx(styles.dateOptionsContainer)}>
					{datepickerPanelOpen && (
						<div className={styles.datepickerContainer}>
							<h3>Set Custom Time Range</h3>
							<RangePicker
								getPopupContainer={() =>
									containerRef?.current || document.body
								}
								disabledDate={(current) =>
									current && current > moment().endOf('day')
								}
								className={styles.datepicker}
								open
								autoFocus
								showTime
								showNow
								format={DATE_FORMAT}
								value={[
									moment(timeRange.start_date),
									moment(timeRange.end_date),
								]}
								onChange={(values) => {
									if (!values) {
										const endDate = moment().format()

										setTimeRange(
											moment(endDate)
												.subtract(15, 'minutes')
												.format(),
											endDate,
										)
									} else {
										setTimeRange(
											moment(values?.[0]).format(),
											moment(values?.[1]).format(),
											true,
										)
									}
								}}
								onCalendarChange={(_, __, { range }) => {
									if (range === 'end') {
										setOpen(false)
									}
								}}
							/>
						</div>
					)}

					<div className={styles.dateOptions}>
						<form
							className={styles.dateOption}
							tabIndex={0}
							onSubmit={(e) => {
								e.preventDefault()

								const offset = customDateRange.replace(
									/\D/g,
									'',
								)
								const unit = customDateRange
									.replace(offset, '')
									.trim()

								if (UNITS.indexOf(unit) === -1) {
									return
								}

								const endDate = moment().format()

								setTimeRange(
									moment(endDate)
										.subtract(offset, unit as any)
										.format(),
									endDate,
								)

								setCustomDateRange('')
								setOpen(false)
							}}
						>
							<input
								autoFocus
								className={styles.input}
								value={customDateRange}
								onChange={(e) =>
									setCustomDateRange(e.target.value)
								}
								placeholder={`"1w", "7 days", or "37m"`}
							/>
						</form>

						{DATE_OPTIONS.map((option) => (
							<button
								className={styles.dateOption}
								tabIndex={0}
								key={option.offset}
								type="button"
								onClick={() => {
									setOpen(false)

									const endDate = moment()
										.startOf('minute')
										.format()
									const startDate = moment(endDate)
										.subtract(option.offset, 'minutes')
										.format()

									setTimeRange(startDate, endDate)
								}}
							>
								{option.label}
							</button>
						))}

						<button
							className={styles.dateOption}
							tabIndex={0}
							onClick={() =>
								setDatepickerPanelOpen(!datepickerPanelOpen)
							}
						>
							Custom
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

const HOUR = 60
const DAY = 60 * 24
const WEEK = 60 * 24 * 7
const MONTH = 60 * 24 * 30
type Units = 'minute' | 'hour' | 'day' | 'week' | 'month'

const buildDateRangeLabel = (range: DataTimeRange) => {
	let diff: number = range.lookback
	let unit: Units = 'minute'

	if (range.absolute) {
		return absoluteFormat(range)
	}

	if (range.lookback < HOUR) {
		unit = 'minute'
		diff = range.lookback
	} else if (range.lookback < DAY) {
		unit = 'hour'
		diff = range.lookback / HOUR
	} else if (range.lookback < WEEK) {
		unit = 'day'
		diff = range.lookback / DAY
	} else if (range.lookback < MONTH) {
		unit = 'week'
		diff = range.lookback / WEEK

		// Return days when not an exact number of weeks.
		if (diff % 1 !== 0) {
			unit = 'day'
			diff = range.lookback / DAY
		}
	} else {
		unit = 'month'

		// Calculation isn't as straightforward for months, so use moment.
		diff = moment(range.end_date).diff(
			moment(range.start_date),
			'months',
			true,
		)

		// Round to a month when the diff is very close to a whole number, which
		// sometimes happens when selecting full months.
		if (diff.toFixed(2).split('.')[1] === '00') {
			diff = Math.round(diff)
		}
	}

	// Display a range if we don't have a whole number.
	if (diff % 1 !== 0) {
		return absoluteFormat(range)
	}

	return `${diff} ${diff > 1 ? `${unit}s` : unit}`
}

const absoluteFormat = (range: DataTimeRange) => {
	return `${moment(range.start_date).format(DATE_FORMAT)} - ${moment(
		range.end_date,
	).format(DATE_FORMAT)}`
}

export default TimeRangePicker
