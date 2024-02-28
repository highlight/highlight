import Switch from '@components/Switch/Switch'
import { useGetWorkspaceSettingsQuery } from '@graph/hooks'
import {
	Box,
	getNow,
	IconSolidAdjustments,
	IconSolidCheck,
	IconSolidClipboardList,
	IconSolidDocumentDownload,
	IconSolidFastForward,
	IconSolidSortDescending,
	IconSolidTrash,
	Menu,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
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
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useAuthorization } from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'
import { useGenerateSessionsReportCSV } from '@util/session/report'
import { message } from 'antd'
import { H } from 'highlight.run'
import React, { useRef, useState } from 'react'

import { ClickhouseQuery } from '@/graph/generated/schemas'

import DeleteSessionsModal from '../DeleteSessionsModal/DeleteSessionsModal'
import * as styles from './SessionFeedConfigurationV2.css'

const Section: React.FC<React.PropsWithChildren<{ clickable?: true }>> = ({
	children,
	clickable,
}) => (
	<Box
		py="4"
		display="flex"
		flexDirection="column"
		borderBottom="divider"
		cursor={clickable ? 'pointer' : 'default'}
		userSelect="none"
	>
		{children}
	</Box>
)

const SectionRow: React.FC<React.PropsWithChildren> = ({ children }) => (
	<Box
		display="flex"
		alignItems="center"
		justifyContent="space-between"
		py="6"
		px="8"
		width="full"
	>
		{children}
	</Box>
)

const IconGroup: React.FC<{ icon: React.ReactNode; text: string }> = ({
	icon,
	text,
}) => (
	<>
		<Box
			display="flex"
			alignItems="center"
			gap="4"
			style={{ flexGrow: '1' }}
		>
			{icon}
			<Text size="small" weight="medium" color="secondaryContentText">
				{text}
			</Text>
		</Box>
	</>
)

export const DropdownMenu = function ({
	sessionQuery,
}: {
	sessionQuery: ClickhouseQuery
}) {
	const { sessionResults } = useReplayerContext()
	const { checkPolicyAccess } = useAuthorization()
	const canDelete = checkPolicyAccess({
		policyName: POLICY_NAMES.DeleteSessions,
	})
	const [showModal, setShowModal] = useState(false)

	const { currentWorkspace } = useApplicationContext()
	const { data: workspaceSettingsData } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id,
	})
	const { generateSessionsReportCSV } = useGenerateSessionsReportCSV()

	const showDeleteButton =
		canDelete &&
		workspaceSettingsData?.workspaceSettings?.enable_data_deletion === true
	const showReportButton =
		workspaceSettingsData?.workspaceSettings?.enable_session_export === true

	const { autoPlaySessions, setAutoPlaySessions, setAutoPlayVideo } =
		usePlayerConfiguration()
	const sessionFeedConfiguration = useSessionFeedConfiguration()

	const menuRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	return (
		<Menu>
			<Menu.Button
				kind="secondary"
				size="small"
				emphasis="low"
				iconRight={<IconSolidAdjustments size={14} />}
				ref={buttonRef}
			/>
			<Menu.List
				ref={menuRef}
				style={{ minWidth: 264 }}
				cssClass={styles.menuContents}
			>
				<Section>
					<Menu.Item
						key="autoplay"
						className={styles.menuItem}
						onClick={(e) => {
							e.preventDefault()
							setAutoPlaySessions(!autoPlaySessions)
							if (autoPlaySessions)
								setAutoPlayVideo(autoPlaySessions)
						}}
					>
						<SectionRow>
							<IconGroup
								icon={
									<IconSolidFastForward
										size={16}
										color={
											vars.theme.interactive.fill
												.secondary.content.text
										}
									/>
								}
								text="Autoplay Sessions"
							/>
							<Switch
								trackingId="SessionFeedAutoplaySessionsToggle"
								checked={autoPlaySessions}
							/>
						</SectionRow>
					</Menu.Item>
				</Section>
				<Section>
					<Menu.Item key="order" className={styles.menuItem}>
						<SectionRow>
							<IconGroup
								icon={
									<IconSolidSortDescending
										size={16}
										color={
											vars.theme.interactive.fill
												.secondary.content.text
										}
									/>
								}
								text="Sort by"
							/>
							<Menu>
								<Menu.Button
									kind="secondary"
									size="small"
									emphasis="low"
									cssClass={styles.menuButton}
									onClick={(e: any) => e.preventDefault()}
								>
									{getSortOrderDisplayName(
										sessionFeedConfiguration.sortOrder,
									)}
								</Menu.Button>

								<Menu.List cssClass={styles.menuContents}>
									{sortOrders.map((sortOrder) => (
										<Menu.Item
											key={sortOrder}
											onClick={(e) => {
												e.preventDefault()
												sessionFeedConfiguration.setSortOrder(
													sortOrder,
												)
											}}
										>
											<SectionRow>
												<IconGroup
													icon={
														sortOrder ===
														sessionFeedConfiguration.sortOrder ? (
															<IconSolidCheck
																size={16}
																color={
																	vars.theme
																		.interactive
																		.fill
																		.primary
																		.enabled
																}
															/>
														) : (
															<Box
																style={{
																	width: 16,
																	height: 16,
																}}
															/>
														)
													}
													text={getSortOrderDisplayName(
														sortOrder,
													)}
												/>
											</SectionRow>
										</Menu.Item>
									))}
								</Menu.List>
							</Menu>
						</SectionRow>
					</Menu.Item>
					<Menu.Item key="date" className={styles.menuItem}>
						<SectionRow>
							<IconGroup
								icon={
									<IconSolidClipboardList
										size={16}
										color={
											vars.theme.interactive.fill
												.secondary.content.text
										}
									/>
								}
								text="Date format"
							/>
							<Menu>
								<Menu.Button
									kind="secondary"
									size="small"
									emphasis="low"
									cssClass={styles.menuButton}
									onClick={(e: any) => e.preventDefault()}
								>
									{formatDatetime(
										getNow().toISOString(),
										sessionFeedConfiguration.datetimeFormat,
									)}
								</Menu.Button>

								<Menu.List cssClass={styles.menuContents}>
									{dateTimeFormats.map((dt) => (
										<Menu.Item
											key={dt}
											onClick={(e) => {
												e.preventDefault()
												sessionFeedConfiguration.setDatetimeFormat(
													dt,
												)
											}}
										>
											<SectionRow>
												<IconGroup
													icon={
														dt ===
														sessionFeedConfiguration.datetimeFormat ? (
															<IconSolidCheck
																size={16}
																color={
																	vars.theme
																		.interactive
																		.fill
																		.primary
																		.enabled
																}
															/>
														) : (
															<Box
																style={{
																	width: 16,
																	height: 16,
																}}
															/>
														)
													}
													text={formatDatetime(
														getNow().toISOString(),
														dt,
													)}
												/>
											</SectionRow>
										</Menu.Item>
									))}
								</Menu.List>
							</Menu>
						</SectionRow>
					</Menu.Item>
					<Menu.Item key="count" className={styles.menuItem}>
						<SectionRow>
							<IconGroup
								icon={
									<IconSolidClipboardList
										size={16}
										color={
											vars.theme.interactive.fill
												.secondary.content.text
										}
									/>
								}
								text="Count format"
							/>
							<Menu>
								<Menu.Button
									kind="secondary"
									size="small"
									emphasis="low"
									cssClass={styles.menuButton}
									onClick={(e: any) => e.preventDefault()}
								>
									{formatCount(
										12321,
										sessionFeedConfiguration.countFormat,
									)}
								</Menu.Button>

								<Menu.List cssClass={styles.menuContents}>
									{countFormats.map((format) => (
										<Menu.Item
											key={format}
											onClick={(e) => {
												e.preventDefault()
												sessionFeedConfiguration.setCountFormat(
													format,
												)
											}}
										>
											<SectionRow>
												<IconGroup
													icon={
														format ===
														sessionFeedConfiguration.countFormat ? (
															<IconSolidCheck
																size={16}
																color={
																	vars.theme
																		.interactive
																		.fill
																		.primary
																		.enabled
																}
															/>
														) : (
															<Box
																style={{
																	width: 16,
																	height: 16,
																}}
															/>
														)
													}
													text={formatCount(
														12321,
														format,
													).toString()}
												/>
											</SectionRow>
										</Menu.Item>
									))}
								</Menu.List>
							</Menu>
						</SectionRow>
					</Menu.Item>
				</Section>
				{showReportButton ? (
					<Section clickable>
						<Menu.Item
							key="download"
							className={styles.menuItem}
							onClick={async () => {
								message.info(
									'Preparing CSV report, this may take a bit...',
								)
								try {
									await generateSessionsReportCSV()
									message.success(
										'CSV report prepared, downloading...',
									)
								} catch (e) {
									message.error(
										`Failed to generate the CSV report: ${e}`,
									)
									H.consumeError(e as Error)
								}
							}}
						>
							<SectionRow>
								<IconGroup
									icon={
										<IconSolidDocumentDownload
											size={16}
											color={
												vars.theme.interactive.fill
													.secondary.content.text
											}
										/>
									}
									text="Download CSV session report"
								/>
							</SectionRow>
						</Menu.Item>
					</Section>
				) : null}
				{showDeleteButton ? (
					<Section clickable>
						<Menu.Item
							key="delete"
							className={styles.menuItem}
							onClick={() => setShowModal(true)}
						>
							<SectionRow>
								<IconGroup
									icon={
										<IconSolidTrash
											size={16}
											color={
												vars.theme.interactive.fill
													.secondary.content.text
											}
										/>
									}
									text={`Delete ${
										sessionResults.totalCount
									} Session${
										sessionResults.totalCount !== 1
											? 's'
											: ''
									}?`}
								/>
							</SectionRow>
						</Menu.Item>
						<DeleteSessionsModal
							visible={showModal}
							setVisible={setShowModal}
							query={sessionQuery}
							sessionCount={sessionResults.totalCount}
						/>
					</Section>
				) : null}
			</Menu.List>
		</Menu>
	)
}
