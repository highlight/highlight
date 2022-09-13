import Button from '@components/Button/Button/Button'
import Popover from '@components/Popover/Popover'
import Select from '@components/Select/Select'
import SvgSettingsIcon from '@icons/SettingsIcon'
import {
	countFormats,
	dateTimeFormats,
	SESSION_FEED_COUNT_FORMAT,
	SESSION_FEED_DATETIME_FORMAT,
	SESSION_FEED_SORT_ORDER,
	SessionFeedConfigurationContext,
	sortOrders,
} from '@pages/Sessions/SessionsFeedV2/context/SessionFeedConfigurationContext'
import { formatNumber } from '@util/numbers'
import { H } from 'highlight.run'
import moment from 'moment'
import React from 'react'

import styles from './SessionFeedConfiguration.module.scss'

interface Props {
	configuration: SessionFeedConfigurationContext
}

const SessionFeedConfiguration = React.memo(
	({
		configuration: {
			datetimeFormat,
			setDatetimeFormat,
			countFormat,
			setCountFormat,
			setSortOrder,
			sortOrder,
		},
	}: Props) => {
		return (
			<Popover
				content={
					<div className={styles.popover}>
						<label className={styles.label}>
							Session Created At Sort Order
							<Select
								options={sortOrders.map((sortOrder) => ({
									displayValue: `${getSortOrderDisplayName(
										sortOrder,
									)}`,
									value: sortOrder,
									id: sortOrder,
								}))}
								value={sortOrder}
								onChange={setSortOrder}
							/>
						</label>
						<label className={styles.label}>
							Datetime Format
							<Select
								options={dateTimeFormats.map((format) => ({
									displayValue: `${formatDatetime(
										new Date().toISOString(),
										format,
									)}`,
									value: format,
									id: format,
								}))}
								value={datetimeFormat}
								onChange={setDatetimeFormat}
							/>
						</label>
						<label className={styles.label}>
							Count Format
							<Select
								options={countFormats.map((format) => ({
									displayValue: `${formatCount(
										12321,
										format,
									)}`,
									value: format,
									id: format,
								}))}
								value={countFormat}
								onChange={setCountFormat}
							/>
						</label>
					</div>
				}
				placement="right"
				trigger={['click']}
			>
				<Button
					trackingId="SessionFeedConfiguration"
					size="small"
					type="ghost"
				>
					<SvgSettingsIcon />
				</Button>
			</Popover>
		)
	},
)

export default SessionFeedConfiguration

export const formatDatetime = (
	datetime: string,
	format: SESSION_FEED_DATETIME_FORMAT,
) => {
	switch (format) {
		case 'Relative':
			return moment(datetime).fromNow()
		case 'Date Only':
			return moment(datetime).format('M/D/YY')
		case 'Date and Time':
			return moment(datetime).format('M/D/YY h:mm A')
		case 'Date and Time with Milliseconds':
			return moment(datetime).format('M/D/YY h:mm:s A')
		case 'Unix':
			return moment(datetime).format('X')
		case 'Unix With Milliseconds':
			return moment(datetime).format('x')
		case 'ISO':
			return moment(datetime).toISOString()
		default:
			const error = new Error(
				`Unsupported date format used in formateDatetime: ${format}`,
			)
			H.consumeError(error)
			return datetime
	}
}

export const formatCount = (
	count: number,
	format: SESSION_FEED_COUNT_FORMAT,
) => {
	switch (format) {
		case 'Full':
			return count.toLocaleString()
		case 'Short':
			return formatNumber(count)
		default:
			const error = new Error(
				`Unsupported count format used in formateCount: ${format}`,
			)
			H.consumeError(error)
			return count
	}
}

export const getSortOrderDisplayName = (sortOrder: SESSION_FEED_SORT_ORDER) => {
	switch (sortOrder) {
		case 'Ascending':
			return 'Ascending (Oldest first)'
		case 'Descending':
		default:
			return 'Descending (Newest first)'
	}
}
