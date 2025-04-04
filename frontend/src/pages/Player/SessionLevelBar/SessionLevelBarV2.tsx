import { useAuthContext } from '@authentication/AuthContext'
import {
	CreateAlertButton,
	Divider,
} from '@components/CreateAlertButton/CreateAlertButton'
import { PreviousNextGroup } from '@components/PreviousNextGroup/PreviousNextGroup'
import { toast } from '@components/Toaster'
import { useGetAlertsPagePayloadQuery } from '@graph/hooks'
import { colors } from '@highlight-run/ui/colors'
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
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import analytics from '@util/analytics'
import { delay } from 'lodash'
import React, { useMemo, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { PlayerModeSwitch } from '@/pages/Player/SessionLevelBar/PlayerModeSwitch/PlayerModeSwitch'
import { useSessionParams } from '@/pages/Sessions/utils'
import { ProductType } from '@/graph/generated/schemas'

import SessionShareButtonV2 from '../SessionShareButton/SessionShareButtonV2'
import * as styles from './SessionLevelBarV2.css'
import { useSearchContext } from '@components/Search/SearchContext'
import { useQueryParam } from 'use-query-params'
import {
	PAGE_PARAM,
	PAGE_SIZE,
} from '@components/SearchPagination/SearchPagination'

const DEFAULT_RIGHT_PANEL_VIEWS = [RightPanelView.Event, RightPanelView.Session]

export const SessionLevelBarV2: React.FC<
	React.PropsWithChildren & {
		width: number | string
	}
> = (props) => {
	const [page] = useQueryParam('page', PAGE_PARAM)
	const { projectId } = useProjectId()
	const { sessionSecureId } = useSessionParams()
	const { sessionResults, session } = useReplayerContext()
	const { changeResultIndex } = useSearchContext()

	const { isLoggedIn } = useAuthContext()
	const {
		showLeftPanel,
		setShowLeftPanel,
		showRightPanel,
		setShowRightPanel,
	} = usePlayerConfiguration()
	const { rightPanelView, setRightPanelView } = usePlayerUIContext()

	const { data: alertsData } = useGetAlertsPagePayloadQuery({
		variables: {
			project_id: projectId!,
		},
		skip: !projectId,
	})

	const showCreateAlertButton = useMemo(() => {
		if (!!alertsData?.new_session_alerts?.length) {
			return false
		}

		return !alertsData?.alerts?.some(
			(alert) => alert?.product_type === ProductType.Sessions,
		)
	}, [alertsData])

	const isDefaultView = DEFAULT_RIGHT_PANEL_VIEWS.includes(rightPanelView)

	const sessionIdx = sessionResults.sessions.findIndex(
		(s) => s.secure_id === sessionSecureId,
	)
	const [prev, next] = [sessionIdx - 1, sessionIdx + 1]

	const canMoveForward =
		!!projectId && (page - 1) * PAGE_SIZE + next < sessionResults.totalCount
	const canMoveBackward = !!projectId && (prev >= 0 || page > 1)

	useHotkeys(
		'j',
		() => {
			if (canMoveForward && projectId && changeResultIndex) {
				analytics.track('NextSessionKeyboardShortcut')
				changeResultIndex(next)
			}
		},
		[canMoveForward, next, changeResultIndex],
	)

	useHotkeys(
		'k',
		() => {
			if (canMoveBackward && projectId && changeResultIndex) {
				analytics.track('PrevSessionKeyboardShortcut')
				changeResultIndex(prev)
			}
		},
		[canMoveBackward, prev, changeResultIndex],
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
							if (projectId && changeResultIndex) {
								changeResultIndex(prev)
							}
						}}
						canMoveBackward={canMoveBackward}
						onNext={() => {
							if (projectId && changeResultIndex) {
								changeResultIndex(next)
							}
						}}
						canMoveForward={canMoveForward}
						size="small"
					/>
					<SessionViewportMetadata />
					<SessionCurrentUrl />
				</Box>
				<Box cssClass={styles.rightButtons}>
					{session && (
						<>
							<SessionShareButtonV2 />
							{showCreateAlertButton ? (
								<CreateAlertButton
									type={ProductType.Sessions}
								/>
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
								checked={
									showRightPanel &&
									(isDefaultView ||
										rightPanelView ===
											RightPanelView.Comments)
								}
								iconLeft={<IconSolidMenuAlt_3 size={14} />}
								disabled={
									rightPanelView === RightPanelView.Comments
								}
							/>
						</>
					)}
				</Box>
			</Box>
		</Box>
	)
}

export default SessionLevelBarV2

export const SessionViewportMetadata = () => {
	const { session, viewport } = useReplayerContext()

	if (!session) {
		return null
	}

	return (
		<Stack direction="row" gap="4" align="center">
			{viewport?.width && viewport?.height && (
				<Badge
					iconStart={<IconSolidTemplate color={colors.n9} />}
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
					session.privacy_setting === 'strict' ||
					session?.enable_strict_privacy ? (
						<IconSolidLockClosed color={colors.n9} />
					) : (
						<IconSolidLockOpen color={colors.n9} />
					)
				}
				title={
					session.privacy_setting === 'strict' ||
					session?.enable_strict_privacy
						? 'Strict privacy on'
						: 'Strict privacy off'
				}
			/>
		</Stack>
	)
}

export const SessionCurrentUrl = () => {
	const { currentUrl } = useReplayerContext()
	const [copyShown, setCopyShown] = useState<boolean>(false)
	const delayRef = useRef<number>(undefined)

	return (
		<>
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
					delayRef.current = delay(() => setCopyShown(false), 200)
				}}
			>
				<TextLink href={currentUrl || ''} underline="none" color="none">
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
						delayRef.current = delay(() => setCopyShown(false), 200)
					}}
					onClick={() => {
						if (currentUrl?.length) {
							navigator.clipboard.writeText(currentUrl)
							toast.success('Copied url to clipboard')
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
		</>
	)
}
