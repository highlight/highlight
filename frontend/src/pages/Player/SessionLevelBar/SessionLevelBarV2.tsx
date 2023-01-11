import { useAuthContext } from '@authentication/AuthContext'
import { KeyboardShortcut } from '@components/KeyboardShortcut/KeyboardShortcut'
import { DEFAULT_PAGE_SIZE } from '@components/Pagination/Pagination'
import { useGetSessionsOpenSearchQuery } from '@graph/hooks'
import {
	Box,
	ButtonIcon,
	IconSolidChatAlt_2,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	IconSolidDocumentDuplicate,
	IconSolidExitRight,
	IconSolidLockClosed,
	IconSolidLockOpen,
	IconSolidMenuAlt_3,
	IconSolidTemplate,
	SwitchButton,
	Text,
	TextLink,
	Tooltip,
} from '@highlight-run/ui'
import { shadows } from '@highlight-run/ui/src/components/Button/styles.css'
import { colors } from '@highlight-run/ui/src/css/colors'
import { useProjectId } from '@hooks/useProjectId'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { changeSession } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import ExplanatoryPopover from '@pages/Player/Toolbar/ExplanatoryPopover/ExplanatoryPopover'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { defaultSessionsQuery } from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import clsx from 'clsx'
import { delay } from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useHistory } from 'react-router-dom'

import SessionShareButtonV2 from '../SessionShareButton/SessionShareButtonV2'
import * as styles from './SessionLevelBarV2.css'

export const SessionLevelBarV2: React.FC<
	React.PropsWithChildren & {
		width: number | string
	}
> = (props) => {
	const [copyShown, setCopyShown] = useState<boolean>(false)
	const delayRef = useRef<number>()
	const history = useHistory()
	const { projectId: project_id } = useProjectId()
	const { session_secure_id } = useParams<{
		session_secure_id: string
	}>()
	const { viewport, currentUrl, sessionResults, setSessionResults, session } =
		useReplayerContext()
	const { page } = useSearchContext()
	const { isLoggedIn } = useAuthContext()
	const {
		showLeftPanel,
		setShowLeftPanel,
		showRightPanel,
		setShowRightPanel,
	} = usePlayerConfiguration()
	const { selectedRightPanelTab, setSelectedRightPanelTab } =
		usePlayerUIContext()
	const query = useMemo(() => JSON.stringify(defaultSessionsQuery), [])
	const { data } = useGetSessionsOpenSearchQuery({
		variables: {
			query,
			count: DEFAULT_PAGE_SIZE,
			page: page && page > 0 ? page : 1,
			project_id,
			sort_desc: true,
		},
		fetchPolicy: 'cache-first',
	})

	const sessionIdx = sessionResults.sessions.findIndex(
		(s) => s.secure_id === session_secure_id,
	)
	const [prev, next] = [sessionIdx - 1, sessionIdx + 1]

	useEffect(() => {
		if (
			!sessionResults.sessions.length &&
			data?.sessions_opensearch.sessions.length
		) {
			setSessionResults({
				...data.sessions_opensearch,
				sessions: data.sessions_opensearch.sessions.map((s) => ({
					...s,
					payload_updated_at: new Date().toISOString(),
				})),
			})
		}
	}, [
		data?.sessions_opensearch,
		sessionResults.sessions.length,
		setSessionResults,
	])

	const canMoveForward = sessionResults.sessions[next]
	const canMoveBackward = sessionResults.sessions[prev]

	useHotkeys(
		'j',
		() => {
			if (canMoveForward) {
				analytics.track('NextSessionKeyboardShortcut')
				changeSession(
					project_id,
					history,
					sessionResults.sessions[next],
					'',
				)
			}
		},
		[canMoveForward, next],
	)

	useHotkeys(
		'k',
		() => {
			if (canMoveBackward) {
				analytics.track('NextSessionKeyboardShortcut')
				changeSession(
					project_id,
					history,
					sessionResults.sessions[prev],
					'',
				)
			}
		},
		[canMoveBackward, prev],
	)

	return (
		<Box
			className={styles.sessionLevelBarV2}
			style={{ width: props.width }}
		>
			<Box
				p="6"
				gap="12"
				display="flex"
				width="full"
				justifyContent="space-between"
				align="center"
			>
				<Box className={styles.leftButtons}>
					{isLoggedIn && !showLeftPanel && (
						<ButtonIcon
							kind="secondary"
							size="small"
							shape="square"
							emphasis="medium"
							icon={
								<IconSolidExitRight
									size={14}
									color={colors.n11}
								/>
							}
							onClick={() => setShowLeftPanel(true)}
							className={styles.openLeftPanelButton}
						/>
					)}
					<Box
						borderRadius="6"
						display="flex"
						marginRight="8"
						style={{
							boxShadow: shadows.n5,
							height: 28,
							width: 56,
						}}
					>
						<Tooltip
							placement="bottom"
							trigger={
								<ButtonIcon
									kind="secondary"
									size="small"
									shape="square"
									emphasis="low"
									icon={
										<IconSolidCheveronUp
											size={14}
											color={colors.n11}
										/>
									}
									cssClass={clsx(
										styles.sessionSwitchButton,
										styles.sessionSwitchButtonLeft,
									)}
									onClick={() => {
										changeSession(
											project_id,
											history,
											sessionResults.sessions[prev],
											'',
										)
									}}
									disabled={!canMoveBackward}
								/>
							}
						>
							<KeyboardShortcut label="Previous" shortcut="k" />
						</Tooltip>
						<Box as="span" borderRight="secondary" />
						<Tooltip
							placement="bottom"
							trigger={
								<ButtonIcon
									kind="secondary"
									size="small"
									shape="square"
									emphasis="low"
									icon={
										<IconSolidCheveronDown
											size={14}
											color={colors.n11}
										/>
									}
									title="j"
									cssClass={clsx(
										styles.sessionSwitchButton,
										styles.sessionSwitchButtonRight,
									)}
									onClick={() => {
										changeSession(
											project_id,
											history,
											sessionResults.sessions[next],
											'',
										)
									}}
									disabled={!canMoveForward}
								/>
							}
						>
							<KeyboardShortcut label="Next" shortcut="j" />
						</Tooltip>
					</Box>
					<Box
						className={styles.currentUrl}
						onMouseEnter={() => {
							if (delayRef.current) {
								window.clearTimeout(delayRef.current)
								delayRef.current = 0
							}
							setCopyShown(true)
						}}
						onMouseLeave={() => {
							delayRef.current = delay(
								() => setCopyShown(false),
								200,
							)
						}}
					>
						<TextLink
							href={currentUrl || ''}
							underline="none"
							color="none"
						>
							{currentUrl}
						</TextLink>
					</Box>
					{currentUrl && (
						<Box
							cursor="pointer"
							paddingLeft="8"
							display="flex"
							align="center"
							onMouseEnter={() => {
								if (delayRef.current) {
									window.clearTimeout(delayRef.current)
									delayRef.current = 0
								}
								setCopyShown(true)
							}}
							onMouseLeave={() => {
								delayRef.current = delay(
									() => setCopyShown(false),
									200,
								)
							}}
							onClick={() => {
								if (currentUrl?.length) {
									navigator.clipboard.writeText(currentUrl)
									message.success('Copied url to clipboard')
								}
							}}
						>
							<IconSolidDocumentDuplicate
								color={colors.n9}
								style={{
									opacity: copyShown ? 1 : 0,
									transition: 'opacity 0.1s ease-in-out',
								}}
							/>
						</Box>
					)}
				</Box>
				<Box className={styles.rightButtons}>
					{session && (
						<>
							<Box display="flex" align="center" gap="2">
								<ExplanatoryPopover
									content={
										<Text
											size="medium"
											color="n11"
											userSelect="none"
										>
											Application viewport size (pixels)
										</Text>
									}
								>
									<IconSolidTemplate color={colors.n9} />
									<Text
										size="medium"
										color="n11"
										userSelect="none"
									>
										{viewport?.width} x {viewport?.height}
									</Text>
								</ExplanatoryPopover>
							</Box>
							<Box display="flex" align="center" gap="2">
								<ExplanatoryPopover
									content={
										<Text
											size="medium"
											color="n11"
											userSelect="none"
										>
											Recording strict privacy{' '}
											{session?.enable_strict_privacy
												? 'on'
												: 'off'}
										</Text>
									}
								>
									{session?.enable_strict_privacy ? (
										<IconSolidLockClosed
											color={colors.n9}
										/>
									) : (
										<IconSolidLockOpen color={colors.n9} />
									)}
								</ExplanatoryPopover>
							</Box>
							<Box display="flex" align="center" gap="6">
								<SessionShareButtonV2 />
								<ExplanatoryPopover
									content={
										<>
											<Text userSelect="none" color="n11">
												Comments
											</Text>
										</>
									}
								>
									<SwitchButton
										size="small"
										onChange={() => {
											if (
												selectedRightPanelTab !==
												'Threads'
											) {
												setSelectedRightPanelTab(
													'Threads',
												)
											}
											setShowRightPanel(
												!showRightPanel ||
													selectedRightPanelTab !==
														'Threads',
											)
										}}
										checked={
											showRightPanel &&
											selectedRightPanelTab === 'Threads'
										}
										iconLeft={
											<IconSolidChatAlt_2 size={14} />
										}
									/>
								</ExplanatoryPopover>
								<ButtonIcon
									kind="secondary"
									size="small"
									shape="square"
									emphasis={showRightPanel ? 'high' : 'low'}
									cssClass={
										showRightPanel
											? styles.rightPanelButtonShown
											: styles.rightPanelButtonHidden
									}
									icon={<IconSolidMenuAlt_3 />}
									onClick={() => {
										setShowRightPanel(!showRightPanel)
									}}
								/>
							</Box>
						</>
					)}
				</Box>
			</Box>
		</Box>
	)
}

export default SessionLevelBarV2
