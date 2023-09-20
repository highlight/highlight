import { useAuthContext } from '@authentication/AuthContext'
import {
	CreateAlertButton,
	Divider,
} from '@components/CreateAlertButton/CreateAlertButton'
import { DEFAULT_PAGE_SIZE } from '@components/Pagination/Pagination'
import { PreviousNextGroup } from '@components/PreviousNextGroup/PreviousNextGroup'
import {
	useGetAlertsPagePayloadQuery,
	useGetSessionsOpenSearchQuery,
} from '@graph/hooks'
import {
	Badge,
	Box,
	ButtonIcon,
	IconSolidDocumentDuplicate,
	IconSolidExitRight,
	IconSolidLockClosed,
	IconSolidLockOpen,
	IconSolidMenuAlt_3,
	IconSolidTemplate,
	Stack,
	SwitchButton,
	TextLink,
} from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { useProjectId } from '@hooks/useProjectId'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import { changeSession } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { delay } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'

import { PlayerModeSwitch } from '@/pages/Player/SessionLevelBar/PlayerModeSwitch/PlayerModeSwitch'

import SessionShareButtonV2 from '../SessionShareButton/SessionShareButtonV2'
import * as styles from './SessionLevelBarV2.css'

const DEFAULT_RIGHT_PANEL_VIEWS = [RightPanelView.Event, RightPanelView.Session]

export const SessionLevelBarV2: React.FC<
	React.PropsWithChildren & {
		width: number | string
	}
> = (props) => {
	const [copyShown, setCopyShown] = useState<boolean>(false)
	const delayRef = useRef<number>()
	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const { session_secure_id } = useParams<{
		session_secure_id: string
	}>()
	const { viewport, currentUrl, sessionResults, setSessionResults, session } =
		useReplayerContext()
	const { page, backendSearchQuery, searchQuery } = useSearchContext()
	const { isLoggedIn } = useAuthContext()
	const {
		showLeftPanel,
		setShowLeftPanel,
		showRightPanel,
		setShowRightPanel,
	} = usePlayerConfiguration()
	const { rightPanelView, setRightPanelView } = usePlayerUIContext()
	const { data } = useGetSessionsOpenSearchQuery({
		variables: {
			query: backendSearchQuery?.searchQuery || '',
			clickhouse_query: JSON.parse(searchQuery),
			count: DEFAULT_PAGE_SIZE,
			page: page && page > 0 ? page : 1,
			project_id: projectId!,
			sort_desc: true,
		},
		fetchPolicy: 'cache-first',
		skip: !projectId || !backendSearchQuery?.searchQuery,
	})
	const { data: alertsData } = useGetAlertsPagePayloadQuery({
		variables: {
			project_id: projectId!,
		},
		skip: !projectId,
	})
	const showCreateAlertButton = alertsData?.new_session_alerts?.length === 0

	const isDefaultView = DEFAULT_RIGHT_PANEL_VIEWS.includes(rightPanelView)

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

	const canMoveForward = !!projectId && sessionResults.sessions[next]
	const canMoveBackward = !!projectId && sessionResults.sessions[prev]

	useHotkeys(
		'j',
		() => {
			if (canMoveForward && projectId) {
				analytics.track('NextSessionKeyboardShortcut')
				changeSession(
					projectId,
					navigate,
					sessionResults.sessions[next],
				)
			}
		},
		[canMoveForward, next],
	)

	useHotkeys(
		'k',
		() => {
			if (canMoveBackward && projectId) {
				analytics.track('PrevSessionKeyboardShortcut')
				changeSession(
					projectId,
					navigate,
					sessionResults.sessions[prev],
				)
			}
		},
		[canMoveBackward, prev],
	)

	return (
		<Box cssClass={styles.sessionLevelBarV2} style={{ width: props.width }}>
			<Box
				p="6"
				gap="12"
				display="flex"
				width="full"
				justifyContent="space-between"
				align="center"
			>
				<Box cssClass={styles.leftButtons}>
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
							cssClass={styles.openLeftPanelButton}
						/>
					)}
					<PreviousNextGroup
						onPrev={() => {
							if (projectId) {
								changeSession(
									projectId,
									navigate,
									sessionResults.sessions[prev],
								)
							}
						}}
						canMoveBackward={!!canMoveBackward}
						onNext={() => {
							if (projectId) {
								changeSession(
									projectId,
									navigate,
									sessionResults.sessions[next],
								)
							}
						}}
						canMoveForward={!!canMoveForward}
						size="small"
					/>
					{session && (
						<Stack direction="row" gap="4" align="center">
							{viewport?.width && viewport?.height && (
								<Badge
									iconStart={
										<IconSolidTemplate color={colors.n9} />
									}
									size="medium"
									variant="gray"
									shape="basic"
									label={`${viewport?.width}x${viewport?.height}`}
									title="Application viewport size (pixels)"
								/>
							)}
							<Badge
								variant="gray"
								size="medium"
								iconStart={
									session?.enable_strict_privacy ? (
										<IconSolidLockClosed
											color={colors.n9}
										/>
									) : (
										<IconSolidLockOpen color={colors.n9} />
									)
								}
								title={
									session?.enable_strict_privacy
										? 'Strict privacy on'
										: 'Strict privacy off'
								}
							/>
						</Stack>
					)}
					<Box
						cssClass={styles.currentUrl}
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
				<Box cssClass={styles.rightButtons}>
					{session && (
						<>
							<SessionShareButtonV2 />
							{showCreateAlertButton ? (
								<CreateAlertButton type="session" />
							) : null}
							<Divider />
							<PlayerModeSwitch />
							<SwitchButton
								size="small"
								onChange={() => {
									if (!isDefaultView) {
										setRightPanelView(RightPanelView.Event)
									}

									setShowRightPanel(
										!showRightPanel || !isDefaultView,
									)
								}}
								checked={showRightPanel && isDefaultView}
								iconLeft={<IconSolidMenuAlt_3 size={14} />}
							/>
						</>
					)}
				</Box>
			</Box>
		</Box>
	)
}

export default SessionLevelBarV2
