import { Button } from '@components/Button'
import Switch from '@components/Switch/Switch'
import { Box, IconSolidDotsHorizontal, Menu, Text } from '@highlight-run/ui'
import { useWindowEvent } from '@hooks/useWindowEvent'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import {
	formatCount,
	formatDatetime,
	getSortOrderDisplayName,
} from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/components/SessionFeedConfiguration/SessionFeedConfiguration'
import {
	countFormats,
	dateTimeFormats,
	sortOrders,
} from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/context/SessionFeedConfigurationContext'
import { useSessionFeedConfiguration } from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/hooks/useSessionFeedConfiguration'
import { useAuthorization } from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'
import { isInsideElement } from '@util/dom'
import React, { useRef, useState } from 'react'

import { ClickhouseQuery } from '@/graph/generated/schemas'

import DeleteSessionsModal from '../DeleteSessionsModal/DeleteSessionsModal'

export const DropdownMenu = function ({
	sessionCount,
	sessionQuery,
}: {
	sessionCount: number
	sessionQuery: ClickhouseQuery
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
	const [open, setOpen] = useState(false)

	const menuRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	const [delayClose, setDelayClose] = useState(false)

	useWindowEvent('click', (event) => {
		if (
			!(
				isInsideElement(event, menuRef.current) ||
				isInsideElement(event, buttonRef.current)
			) &&
			!delayClose
		) {
			setOpen(false)
		}
	})

	return (
		<Menu open={open}>
			<Menu.Button
				kind="secondary"
				size="small"
				emphasis="low"
				iconRight={<IconSolidDotsHorizontal />}
				onClick={() => setOpen(!open)}
				ref={buttonRef}
			/>
			<Menu.List ref={menuRef} style={{ minWidth: 324 }}>
				<Menu.Item
					key="autoplay"
					onClick={() => {
						setAutoPlaySessions(!autoPlaySessions)
						if (autoPlaySessions) setAutoPlayVideo(autoPlaySessions)
					}}
				>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						style={{ height: 28 }}
						width="full"
					>
						<Text
							size="small"
							weight="medium"
							color="secondaryContentText"
						>
							Autoplay Sessions
						</Text>
						<Switch
							trackingId="SessionFeedAutoplaySessionsToggle"
							checked={autoPlaySessions}
						/>
					</Box>
				</Menu.Item>
				<Menu.Item
					key="details"
					onClick={() =>
						setShowDetailedSessionView(!showDetailedSessionView)
					}
				>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						style={{ height: 28 }}
						width="full"
					>
						<Text
							size="small"
							weight="medium"
							color="secondaryContentText"
						>
							Details
						</Text>
						<Switch
							trackingId="SessionFeedShowDetailedSessionsToggle"
							checked={showDetailedSessionView}
						/>
					</Box>
				</Menu.Item>
				<Menu.Item key="createdAtSortOrder">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="16"
						width="full"
					>
						<Text
							size="small"
							weight="medium"
							color="secondaryContentText"
						>
							Order
						</Text>
						<Menu>
							<Menu.Button kind="secondary" emphasis="medium">
								{getSortOrderDisplayName(
									sessionFeedConfiguration.sortOrder,
								)}
							</Menu.Button>

							<Menu.List>
								{sortOrders.map((sortOrder) => (
									<Menu.Item
										key={sortOrder}
										onClick={() => {
											sessionFeedConfiguration.setSortOrder(
												sortOrder,
											)
											setDelayClose(true)
											setTimeout(
												() => setDelayClose(false),
												300,
											)
										}}
									>
										{getSortOrderDisplayName(sortOrder)}
									</Menu.Item>
								))}
							</Menu.List>
						</Menu>
					</Box>
				</Menu.Item>
				<Menu.Item key="datetimeFormat">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="16"
						width="full"
					>
						<Text
							size="small"
							weight="medium"
							color="secondaryContentText"
						>
							Datetime Format
						</Text>
						<Menu>
							<Menu.Button kind="secondary" emphasis="medium">
								{formatDatetime(
									new Date().toISOString(),
									sessionFeedConfiguration.datetimeFormat,
								)}
							</Menu.Button>

							<Menu.List>
								{dateTimeFormats.map((dt) => (
									<Menu.Item
										key={dt}
										onClick={() => {
											sessionFeedConfiguration.setDatetimeFormat(
												dt,
											)
											setDelayClose(true)
											setTimeout(
												() => setDelayClose(false),
												300,
											)
										}}
									>
										{formatDatetime(
											new Date().toISOString(),
											dt,
										)}
									</Menu.Item>
								))}
							</Menu.List>
						</Menu>
					</Box>
				</Menu.Item>
				<Menu.Item key="countFormat">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="16"
						width="full"
					>
						<Text
							size="small"
							weight="medium"
							color="secondaryContentText"
						>
							Count Format
						</Text>

						<Menu>
							<Menu.Button kind="secondary" emphasis="medium">
								{formatCount(
									12321,
									sessionFeedConfiguration.countFormat,
								)}
							</Menu.Button>

							<Menu.List>
								{countFormats.map((format) => (
									<Menu.Item
										key={format}
										onClick={() => {
											sessionFeedConfiguration.setCountFormat(
												format,
											)
											setDelayClose(true)
											setTimeout(
												() => setDelayClose(false),
												300,
											)
										}}
									>
										{formatCount(12321, format)}
									</Menu.Item>
								))}
							</Menu.List>
						</Menu>
					</Box>
				</Menu.Item>
				<Menu.Divider />
				<Box
					display="flex"
					alignItems="center"
					justifyContent="flex-end"
					px="8"
					width="full"
				>
					<Button
						kind="danger"
						disabled={!canDelete}
						onClick={() => setShowModal(true)}
						trackingId="sessionFeedDeleteSessions"
					>
						Delete {sessionCount} Session
						{sessionCount !== 1 ? 's' : ''}?
					</Button>
				</Box>
				<DeleteSessionsModal
					visible={showModal}
					setVisible={setShowModal}
					query={sessionQuery}
					sessionCount={sessionCount}
				/>
			</Menu.List>
		</Menu>
	)
}
