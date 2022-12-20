import Button from '@components/Button/Button/Button'
import Popover from '@components/Popover/Popover'
import Select from '@components/Select/Select'
import SvgSettingsIcon from '@icons/SettingsIcon'
import DeleteSessionsModal from '@pages/Sessions/SessionsFeedV2/components/DeleteSessionsModal/DeleteSessionsModal'
import {
	countFormats,
	dateTimeFormats,
	SESSION_FEED_COUNT_FORMAT,
	SESSION_FEED_DATETIME_FORMAT,
	SESSION_FEED_SORT_ORDER,
	SessionFeedConfigurationContext,
	sortOrders,
} from '@pages/Sessions/SessionsFeedV2/context/SessionFeedConfigurationContext'
import { useAuthorization } from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'
import { formatNumber } from '@util/numbers'
import { Divider } from 'antd'
import { H } from 'highlight.run'
import moment from 'moment'
import React, { useState } from 'react'

import styles from './SessionFeedConfiguration.module.scss'

interface Props {
	configuration: SessionFeedConfigurationContext
	sessionCount: number
	sessionQuery: string
}

const SessionFeedConfiguration = ({
	configuration: {
		datetimeFormat,
		setDatetimeFormat,
		countFormat,
		setCountFormat,
		setSortOrder,
		sortOrder,
	},
	sessionCount,
	sessionQuery,
}: Props) => {
	const { checkPolicyAccess } = useAuthorization()
	const canDelete = checkPolicyAccess({
		policyName: POLICY_NAMES.DeleteSessions,
	})
	const [showModal, setShowModal] = useState(false)

	// Hide popover while modal is showing. If modal is not showing,
	// set `visible=undefined` and defer to the usual behaviour.
	const popoverVisible = showModal ? false : undefined

	const onClick = () => {
		setShowModal(true)
	}

	return (
		<Popover
			visible={popoverVisible}
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
								displayValue: `${formatCount(12321, format)}`,
								value: format,
								id: format,
							}))}
							value={countFormat}
							onChange={setCountFormat}
						/>
					</label>
					<Divider className="m-0" />
					<Button
						trackingId="DeleteSessions"
						danger
						type="primary"
						disabled={!canDelete}
						onClick={onClick}
					>
						<span className="w-full">
							Delete {sessionCount} Session
							{sessionCount !== 1 ? 's' : ''}?
						</span>
					</Button>
					<DeleteSessionsModal
						visible={showModal}
						setVisible={setShowModal}
						query={sessionQuery}
						sessionCount={sessionCount}
					/>
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
}

export default SessionFeedConfiguration

export const formatDatetime = (
	datetime: string,
	format: SESSION_FEED_DATETIME_FORMAT,
) => {
	const dt = moment(datetime)
	switch (format) {
		case 'Smart':
			if (moment().diff(dt, 'years') > 1) {
				return dt.format('M/D/YY')
			} else if (moment().diff(dt, 'month') > 1) {
				return dt.format('M/D HH:mm')
			} else if (moment().diff(dt, 'days') > 1) {
				return dt.format('MMM D h:mm A')
			} else {
				return dt.format('h:mm A')
			}
		case 'Relative':
			return dt.fromNow()
		case 'Date Only':
			return dt.format('M/D/YY')
		case 'Date and Time':
			return dt.format('M/D/YY h:mm A')
		case 'Date and Time with Milliseconds':
			return dt.format('M/D/YY h:mm:s A')
		case 'Unix':
			return dt.format('X')
		case 'Unix With Milliseconds':
			return dt.format('x')
		case 'ISO':
			return dt.toISOString()
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
