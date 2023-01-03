import { Button } from '@components/Button'
import Select from '@components/Select/Select'
import Switch from '@components/Switch/Switch'
import { Box, IconSolidDotsHorizontal, Menu, Text } from '@highlight-run/ui'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import DeleteSessionsModal from '@pages/Sessions/SessionsFeedV2/components/DeleteSessionsModal/DeleteSessionsModal'
import {
	formatCount,
	formatDatetime,
	getSortOrderDisplayName,
} from '@pages/Sessions/SessionsFeedV2/components/SessionFeedConfiguration/SessionFeedConfiguration'
import {
	countFormats,
	dateTimeFormats,
	sortOrders,
} from '@pages/Sessions/SessionsFeedV2/context/SessionFeedConfigurationContext'
import { useSessionFeedConfiguration } from '@pages/Sessions/SessionsFeedV2/hooks/useSessionFeedConfiguration'
import { useAuthorization } from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'
import React, { useState } from 'react'

export const DropdownMenu = function ({
	sessionCount,
	sessionQuery,
}: {
	sessionCount: number
	sessionQuery: string
}) {
	const { checkPolicyAccess } = useAuthorization()
	const canDelete = checkPolicyAccess({
		policyName: POLICY_NAMES.DeleteSessions,
	})
	const [showModal, setShowModal] = useState(false)

	const {
		autoPlaySessions,
		setAutoPlaySessions,
		setAutoPlayVideo,
		showDetailedSessionView,
		setShowDetailedSessionView,
	} = usePlayerConfiguration()
	const sessionFeedConfiguration = useSessionFeedConfiguration()

	const [open, setOpen] = React.useState(false)

	return (
		<Menu open={open}>
			<Menu.Button
				kind="secondary"
				size="small"
				emphasis="low"
				iconRight={<IconSolidDotsHorizontal size={14} />}
				onClick={() => {
					setOpen(!open)
				}}
			></Menu.Button>
			<Menu.List>
				<Menu.Item key="autoplay">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						style={{ height: 40 }}
					>
						<Text>Autoplay Sessions</Text>
						<Switch
							trackingId="SessionFeedAutoplaySessionsToggle"
							checked={autoPlaySessions}
							onChange={(checked: boolean) => {
								setAutoPlaySessions(checked)
								if (checked) setAutoPlayVideo(checked)
							}}
						/>
					</Box>
				</Menu.Item>
				<Menu.Item key="details">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						style={{ height: 40 }}
					>
						<Text>Details</Text>
						<Switch
							trackingId="SessionFeedShowDetailedSessionsToggle"
							checked={showDetailedSessionView}
							onChange={setShowDetailedSessionView}
						/>
					</Box>
				</Menu.Item>
				<Menu.Item key="createdAtSortOrder">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
					>
						Order
						<Select
							options={sortOrders.map((sortOrder) => ({
								displayValue: `${getSortOrderDisplayName(
									sortOrder,
								)}`,
								value: sortOrder,
								id: sortOrder,
							}))}
							value={sessionFeedConfiguration.sortOrder}
							onChange={sessionFeedConfiguration.setSortOrder}
						/>
					</Box>
				</Menu.Item>
				<Menu.Item key="datetimeFormat">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
					>
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
							value={sessionFeedConfiguration.datetimeFormat}
							onChange={
								sessionFeedConfiguration.setDatetimeFormat
							}
						/>
					</Box>
				</Menu.Item>
				<Menu.Item key="countFormat">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
					>
						Count Format
						<Select
							options={countFormats.map((format) => ({
								displayValue: `${formatCount(12321, format)}`,
								value: format,
								id: format,
							}))}
							value={sessionFeedConfiguration.countFormat}
							onChange={sessionFeedConfiguration.setCountFormat}
						/>
					</Box>
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item key="deleteSessions">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="flex-end"
					>
						<Button
							kind="danger"
							disabled={!canDelete}
							onClick={() => setShowModal(true)}
							trackingId="sessionFeedDeleteSessions"
						>
							<span className="w-full">
								Delete {sessionCount} Session
								{sessionCount !== 1 ? 's' : ''}?
							</span>
						</Button>
					</Box>
					<DeleteSessionsModal
						visible={showModal}
						setVisible={setShowModal}
						query={sessionQuery}
						sessionCount={sessionCount}
					/>
				</Menu.Item>
			</Menu.List>
		</Menu>
	)
}
