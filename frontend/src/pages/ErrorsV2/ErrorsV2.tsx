import { useAuthContext } from '@authentication/AuthContext'
import {
	CreateAlertButton,
	Divider,
} from '@components/CreateAlertButton/CreateAlertButton'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { KeyboardShortcut } from '@components/KeyboardShortcut/KeyboardShortcut'
import LoadingBox from '@components/LoadingBox'
import { PreviousNextGroup } from '@components/PreviousNextGroup/PreviousNextGroup'
import {
	useGetAlertsPagePayloadQuery,
	useGetErrorGroupQuery,
	useGetProjectDropdownOptionsQuery,
	useMarkErrorGroupAsViewedMutation,
	useMuteErrorCommentThreadMutation,
} from '@graph/hooks'
import {
	Box,
	ButtonIcon,
	Callout,
	IconSolidExitRight,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { SIGN_IN_ROUTE } from '@pages/Auth/AuthRouter'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { CompleteSetup } from '@pages/ErrorsV2/CompleteSetup/CompleteSetup'
import ErrorBody from '@pages/ErrorsV2/ErrorBody/ErrorBody'
import ErrorTabContent from '@pages/ErrorsV2/ErrorTabContent/ErrorTabContent'
import ErrorTitle from '@pages/ErrorsV2/ErrorTitle/ErrorTitle'
import { IntegrationCta } from '@pages/ErrorsV2/IntegrationCta'
import NoActiveErrorCard from '@pages/ErrorsV2/NoActiveErrorCard/NoActiveErrorCard'
import SearchPanel from '@pages/ErrorsV2/SearchPanel/SearchPanel'
import { getHeaderFromError } from '@pages/ErrorsV2/utils'
import {
	PlayerSearchParameters,
	useLinkLogCursor,
} from '@pages/Player/PlayerHook/utils'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import clsx from 'clsx'
import { useCallback, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { useHotkeys } from 'react-hotkeys-hook'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiObject } from 'rudder-sdk-js'
import { StringParam, useQueryParams } from 'use-query-params'

import { DEMO_PROJECT_ID } from '@/components/DemoWorkspaceButton/DemoWorkspaceButton'
import { GetErrorGroupQuery } from '@/graph/generated/operations'
import ErrorIssueButton from '@/pages/ErrorsV2/ErrorIssueButton/ErrorIssueButton'
import ErrorShareButton from '@/pages/ErrorsV2/ErrorShareButton/ErrorShareButton'
import { ErrorStateSelect } from '@/pages/ErrorsV2/ErrorStateSelect/ErrorStateSelect'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useIntegratedLocalStorage } from '@/util/integrated'

import * as styles from './styles.css'

type Params = { project_id: string; error_secure_id: string; referrer?: string }

export default function ErrorsV2() {
	const { project_id, error_secure_id } = useParams<Params>()
	const { isLoggedIn } = useAuthContext()
	const [{ integrated }] = useIntegratedLocalStorage(project_id!, 'server')

	const { data, loading, errorQueryingErrorGroup } = useErrorGroup()

	const { isBlocked, loading: isBlockedLoading } = useIsBlocked({
		isPublic: data?.error_group?.is_public ?? false,
		projectId: project_id,
	})

	const navigate = useNavigate()
	const location = useLocation()
	const { logCursor } = useLinkLogCursor()
	const [muteErrorCommentThread] = useMuteErrorCommentThreadMutation()
	const navigation = useErrorPageNavigation()

	useAllHotKeys(navigation)

	useEffect(() => {
		if (logCursor) {
			navigation.setShowLeftPanel(false)
		}
	}, [logCursor, navigation])

	useEffect(() => {
		if (
			!isLoggedIn &&
			project_id !== DEMO_PROJECT_ID &&
			!data?.error_group?.is_public &&
			!loading
		) {
			navigate(SIGN_IN_ROUTE, { replace: true })
		}
	}, [
		data?.error_group?.is_public,
		isLoggedIn,
		loading,
		navigate,
		project_id,
	])

	useEffect(() => {
		const urlParams = new URLSearchParams(location.search)
		const commentId = urlParams.get(PlayerSearchParameters.commentId)
		const hasMuted = urlParams.get(PlayerSearchParameters.muted) === '1'

		if (commentId && hasMuted) {
			muteErrorCommentThread({
				variables: {
					id: commentId,
					has_muted: hasMuted,
				},
			}).then(() => {
				const searchParams = new URLSearchParams(location.search)
				searchParams.delete(PlayerSearchParameters.muted)
				navigate(`${location.pathname}?${searchParams.toString()}`)

				message.success('Muted notifications for this comment thread.')
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.search])

	useEffect(() => {
		if (!error_secure_id) {
			return
		}

		analytics.page('Errors', { is_guest: !isLoggedIn })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error_secure_id])

	return (
		<>
			<Helmet>
				<title>Errors</title>
			</Helmet>

			{!isBlocked && (
				<Box cssClass={styles.searchPanelContainer}>
					<SearchPanel />
				</Box>
			)}

			<div
				className={clsx(styles.detailsContainer, {
					[styles.moveDetailsRight]:
						!isBlocked && navigation.showLeftPanel,
				})}
			>
				<Box
					background="white"
					border="dividerWeak"
					borderRadius="6"
					display="flex"
					flexDirection="column"
					height="full"
					shadow="small"
					overflow="hidden"
				>
					<TopBar
						errorGroup={data?.error_group}
						isLoggedIn={isLoggedIn}
						isBlocked={isBlocked}
						projectId={project_id}
						navigation={navigation}
					/>

					<ErrorDisplay
						errorGroup={data?.error_group}
						integrated={integrated}
						isBlocked={isBlocked}
						isBlockedLoading={isBlockedLoading}
						isErrorGroupError={!!errorQueryingErrorGroup}
						isErrorState={!!errorQueryingErrorGroup || isBlocked}
						loading={loading}
					/>
				</Box>
			</div>
		</>
	)
}

type TopBarProps = {
	errorGroup: GetErrorGroupQuery['error_group']
	isLoggedIn: boolean
	isBlocked: boolean
	navigation: ReturnType<typeof useErrorPageNavigation>
	projectId?: string
}
function TopBar({
	errorGroup,
	isLoggedIn,
	isBlocked,
	projectId,
	navigation,
}: TopBarProps) {
	const { data: alertsData } = useGetAlertsPagePayloadQuery({
		variables: {
			project_id: projectId!,
		},
		skip: !projectId,
	})
	const showCreateAlertButton = alertsData?.error_alerts?.length === 0

	const {
		showLeftPanel,
		canMoveBackward,
		canMoveForward,
		nextSecureId,
		previousSecureId,
		goToErrorGroup,
	} = navigation

	return (isLoggedIn || projectId === DEMO_PROJECT_ID) && !isBlocked ? (
		<Box
			display="flex"
			alignItems="center"
			borderBottom="secondary"
			p="6"
			justifyContent="space-between"
		>
			<Box display="flex" gap="8">
				{!showLeftPanel && (
					<Tooltip
						placement="bottom"
						trigger={
							<ButtonIcon
								kind="secondary"
								size="small"
								shape="square"
								emphasis="medium"
								icon={<IconSolidExitRight size={14} />}
								onClick={() =>
									navigation.setShowLeftPanel(true)
								}
							/>
						}
					>
						<KeyboardShortcut
							label="Toggle sidebar"
							shortcut={['cmd', 'b']}
						/>
					</Tooltip>
				)}
				<PreviousNextGroup
					canMoveBackward={canMoveBackward}
					canMoveForward={canMoveForward}
					onPrev={() => goToErrorGroup(previousSecureId)}
					onNext={() => goToErrorGroup(nextSecureId)}
				/>
			</Box>
			<Box>
				{errorGroup && (
					<Box display="flex" gap="8" alignItems="center">
						<ErrorShareButton errorGroup={errorGroup} />
						{showCreateAlertButton ? (
							<CreateAlertButton type="errors" />
						) : null}
						<Divider />
						<ErrorStateSelect
							state={errorGroup.state}
							snoozedUntil={errorGroup.snoozed_until}
						/>
						<ErrorIssueButton errorGroup={errorGroup} />
					</Box>
				)}
			</Box>
		</Box>
	) : null
}

function useAllHotKeys({
	showLeftPanel,
	setShowLeftPanel,
	canMoveBackward,
	canMoveForward,
	nextSecureId,
	previousSecureId,
	goToErrorGroup,
}: ReturnType<typeof useErrorPageNavigation>) {
	useHotkeys(
		'j',
		() => {
			if (canMoveForward) {
				analytics.track('NextErrorGroupKeyboardShortcut')
				goToErrorGroup(nextSecureId)
			}
		},
		[canMoveForward, nextSecureId],
	)

	useHotkeys(
		'k',
		() => {
			if (canMoveBackward) {
				analytics.track('PrevErrorGroupKeyboardShortcut')
				goToErrorGroup(previousSecureId)
			}
		},
		[canMoveBackward, previousSecureId],
	)

	useHotkeys(
		'cmd+b',
		() => {
			setShowLeftPanel(!showLeftPanel)
		},
		[showLeftPanel],
	)
}

type ErrorDisplayProps = {
	errorGroup?: GetErrorGroupQuery['error_group']
	integrated: boolean
	isBlocked: boolean
	isBlockedLoading: boolean
	isErrorGroupError?: boolean
	isErrorState: boolean
	loading: boolean
}
function ErrorDisplay({
	errorGroup,
	integrated,
	isBlocked,
	isBlockedLoading,
	isErrorGroupError,
	isErrorState,
	loading,
}: ErrorDisplayProps) {
	const { error_secure_id } = useParams<Params>()

	switch (true) {
		case loading || isBlockedLoading:
			return <LoadingBox />

		case error_secure_id && !isErrorState:
			return (
				<>
					<Helmet>
						<title>
							Errors:{' '}
							{getHeaderFromError(errorGroup?.event ?? [])}
						</title>
					</Helmet>

					<Box overflowY="scroll" width="full">
						{loading ? (
							<LoadingBox />
						) : (
							<>
								<IntegrationCta />
								<Box
									py="24"
									px="20"
									mx="auto"
									style={{ maxWidth: 940 }}
								>
									<ErrorTitle errorGroup={errorGroup} />

									<ErrorBody errorGroup={errorGroup} />

									<ErrorTabContent errorGroup={errorGroup} />
								</Box>
							</>
						)}
					</Box>
				</>
			)

		case isBlocked:
			return (
				<ErrorState
					title="Enter this Workspace?"
					message={
						"Sadly, you don’t have access to the workspace 😢 Request access and we'll shoot an email to your workspace admin. Alternatively, feel free to make an account!"
					}
					shownWithHeader
					showRequestAccess
				/>
			)

		case isErrorGroupError:
			return (
				<Box m="auto" style={{ maxWidth: 300 }}>
					<Callout kind="info" title="Can't load error">
						<Box pb="6">
							<Text>
								This error does not exist or has not been made
								public.
							</Text>
						</Box>
					</Callout>
				</Box>
			)

		case integrated:
			return <NoActiveErrorCard />

		default:
			return <CompleteSetup />
	}
}

function useErrorGroup() {
	const { error_secure_id } = useParams<Params>()
	const [{ referrer }] = useQueryParams({
		referrer: StringParam,
	})
	const [markErrorGroupAsViewed] = useMarkErrorGroupAsViewedMutation()
	const { isLoggedIn } = useAuthContext()
	const {
		data,
		loading,
		error: errorQueryingErrorGroup,
	} = useGetErrorGroupQuery({
		variables: {
			secure_id: error_secure_id!,
			use_clickhouse: true,
		},
		skip: !error_secure_id,
		onCompleted: () => {
			if (error_secure_id) {
				markErrorGroupAsViewed({
					variables: {
						error_secure_id,
						viewed: true,
					},
				}).catch(console.error)
			}
			const properties: apiObject = {
				is_guest: !isLoggedIn,
			}
			if (referrer) {
				properties.referrer = referrer
			}

			analytics.track('Viewed error', properties)
		},
	})

	return { data, loading, errorQueryingErrorGroup }
}

export function useErrorPageNavigation() {
	const navigate = useNavigate()
	const { project_id, error_secure_id } = useParams<Params>()
	const { searchResultSecureIds } = useErrorSearchContext()
	const { showLeftPanel, setShowLeftPanel } = usePlayerConfiguration()
	const goToErrorGroup = useCallback(
		(secureId: string) => {
			navigate(`/${project_id}/errors/${secureId}${location.search}`, {
				replace: true,
			})
		},
		[navigate, project_id],
	)
	const currentSearchResultIndex = searchResultSecureIds.findIndex(
		(secureId) => secureId === error_secure_id,
	)
	const canMoveForward =
		!!searchResultSecureIds.length &&
		currentSearchResultIndex < searchResultSecureIds.length - 1
	const canMoveBackward =
		!!searchResultSecureIds.length && currentSearchResultIndex > 0
	const nextSecureId = searchResultSecureIds[currentSearchResultIndex + 1]
	const previousSecureId = searchResultSecureIds[currentSearchResultIndex - 1]

	return {
		showLeftPanel,
		setShowLeftPanel,
		canMoveBackward,
		canMoveForward,
		nextSecureId,
		previousSecureId,
		goToErrorGroup,
	}
}

function useIsBlocked({
	isPublic,
	projectId,
}: {
	isPublic: boolean
	projectId?: string
}) {
	const { data, loading } = useGetProjectDropdownOptionsQuery({
		variables: { project_id: projectId! },
		skip: !projectId,
	})
	const isBlocked = useMemo(() => {
		const currentProjectId = data?.project?.id
		const canJoin = data?.joinable_workspaces?.some((w) =>
			w?.projects.map((p) => p?.id).includes(projectId),
		)
		const isDemo = projectId === DEMO_PROJECT_ID

		return (
			!isPublic &&
			!isDemo &&
			!loading &&
			!canJoin &&
			currentProjectId !== projectId
		)
	}, [data, isPublic, loading, projectId])

	return { isBlocked, loading }
}
