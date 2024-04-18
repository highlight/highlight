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
	DEFAULT_TIME_PRESETS,
	IconSolidExitRight,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { SIGN_IN_ROUTE } from '@pages/Auth/AuthRouter'
import { CompleteSetup } from '@pages/ErrorsV2/CompleteSetup/CompleteSetup'
import ErrorBody from '@pages/ErrorsV2/ErrorBody/ErrorBody'
import ErrorTabContent from '@pages/ErrorsV2/ErrorTabContent/ErrorTabContent'
import ErrorTitle from '@pages/ErrorsV2/ErrorTitle/ErrorTitle'
import { IntegrationCta } from '@pages/ErrorsV2/IntegrationCta'
import NoActiveErrorCard from '@pages/ErrorsV2/NoActiveErrorCard/NoActiveErrorCard'
import { SearchPanel } from '@pages/ErrorsV2/SearchPanel/SearchPanel'
import { getHeaderFromError } from '@pages/ErrorsV2/utils'
import {
	PlayerSearchParameters,
	useShowSearchParam,
} from '@pages/Player/PlayerHook/utils'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useHotkeys } from 'react-hotkeys-hook'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiObject } from 'rudder-sdk-js'
import {
	NumberParam,
	StringParam,
	useQueryParam,
	useQueryParams,
	withDefault,
} from 'use-query-params'

import { DEMO_PROJECT_ID } from '@/components/DemoWorkspaceButton/DemoWorkspaceButton'
import { SearchContext } from '@/components/Search/SearchContext'
import { START_PAGE } from '@/components/SearchPagination/SearchPagination'
import { GetErrorGroupQuery } from '@/graph/generated/operations'
import { ErrorState as ErrorStateEnum } from '@/graph/generated/schemas'
import { useSearchTime } from '@/hooks/useSearchTime'
import ErrorIssueButton from '@/pages/ErrorsV2/ErrorIssueButton/ErrorIssueButton'
import ErrorShareButton from '@/pages/ErrorsV2/ErrorShareButton/ErrorShareButton'
import { ErrorStateSelect } from '@/pages/ErrorsV2/ErrorStateSelect/ErrorStateSelect'
import { useGetErrors } from '@/pages/ErrorsV2/useGetErrors'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useIntegratedLocalStorage } from '@/util/integrated'

import {
	DEFAULT_PANEL_WIDTH,
	LOCAL_STORAGE_PANEL_WIDTH_KEY,
	MAX_PANEL_WIDTH,
	MIN_PANEL_WIDTH,
} from './constants'
import * as styles from './styles.css'

type Params = { project_id: string; error_secure_id: string; referrer?: string }

const PAGE_PARAM = withDefault(NumberParam, START_PAGE)
const ERROR_QUERY_PARAM = withDefault(
	StringParam,
	`status=${ErrorStateEnum.Open} `,
)

export default function ErrorsV2() {
	const { project_id, error_secure_id } = useParams<Params>()
	const { isLoggedIn } = useAuthContext()
	const [{ integrated }] = useIntegratedLocalStorage(project_id!, 'server')

	const [query, setQuery] = useQueryParam('query', ERROR_QUERY_PARAM)
	const [page, setPage] = useQueryParam('page', PAGE_PARAM)

	const searchTimeContext = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: DEFAULT_TIME_PRESETS[5],
	})

	const handleSubmit = useCallback(
		(newQuery: string) => {
			setQuery(newQuery)
			setPage(START_PAGE)
		},
		[setPage, setQuery],
	)

	const getErrorsData = useGetErrors({
		query,
		project_id,
		startDate: searchTimeContext.startDate,
		endDate: searchTimeContext.endDate,
		page,
		disablePolling: !searchTimeContext.selectedPreset,
	})

	const { data, loading, errorQueryingErrorGroup } =
		useErrorGroup(error_secure_id)

	const { isBlocked, loading: isBlockedLoading } = useIsBlocked({
		isPublic: data?.error_group?.is_public ?? false,
		projectId: project_id,
	})

	const navigate = useNavigate()
	const location = useLocation()
	const { showSearch } = useShowSearchParam()
	const [muteErrorCommentThread] = useMuteErrorCommentThreadMutation()
	const navigation = useErrorPageNavigation(getErrorsData.errorGroupSecureIds)

	const dragHandleRef = useRef<HTMLDivElement>(null)
	const [dragging, setDragging] = useState(false)

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!dragging) {
				return
			}

			e.stopPropagation()
			e.preventDefault()

			navigation.setLeftPanelWidth(
				Math.min(Math.max(e.clientX, MIN_PANEL_WIDTH), MAX_PANEL_WIDTH),
			)
		},
		[dragging, navigation],
	)

	const handleMouseUp = useCallback(() => {
		setDragging(false)
	}, [])

	useEffect(() => {
		if (dragging) {
			window.addEventListener('mousemove', handleMouseMove, true)
			window.addEventListener('mouseup', handleMouseUp, true)
		} else {
			window.removeEventListener('mousemove', handleMouseMove, true)
			window.removeEventListener('mouseup', handleMouseUp, true)
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove, true)
			window.removeEventListener('mouseup', handleMouseUp, true)
		}
	}, [dragging, handleMouseMove, handleMouseUp])

	useAllHotKeys(navigation)

	useEffect(() => {
		if (!showSearch) {
			navigation.setShowLeftPanel(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

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
				navigate({
					pathname: location.pathname,
					search: searchParams.toString(),
				})

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
		<SearchContext
			initialQuery={query}
			onSubmit={handleSubmit}
			loading={getErrorsData.loading}
			results={getErrorsData.errorGroups}
			totalCount={getErrorsData.totalCount}
			moreResults={getErrorsData.moreErrors}
			resetMoreResults={getErrorsData.resetMoreErrors}
			histogramBucketSize={getErrorsData.histogramBucketSize}
			{...searchTimeContext}
		>
			<Helmet>
				<title>Errors</title>
			</Helmet>

			{!isBlocked && (
				<Box
					display={navigation.showLeftPanel ? 'block' : 'none'}
					position="relative"
					style={{
						width: `${navigation.leftPanelWidth}px`,
					}}
				>
					<Box
						ref={dragHandleRef}
						cssClass={styles.panelDragHandle}
						onMouseDown={(e) => {
							e.preventDefault()
							setDragging(true)
						}}
					/>
					<SearchPanel />
				</Box>
			)}

			<div
				className={styles.detailsContainer}
				style={{
					width:
						!isBlocked && navigation.showLeftPanel
							? `calc(100% - ${navigation.leftPanelWidth}px)`
							: '100%',
				}}
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
		</SearchContext>
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
							errorSecureId={errorGroup.secure_id}
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

export function useErrorGroup(errorSecureId?: string) {
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
			secure_id: errorSecureId!,
			use_clickhouse: true,
		},
		skip: !errorSecureId,
		onCompleted: () => {
			if (errorSecureId) {
				markErrorGroupAsViewed({
					variables: {
						error_secure_id: errorSecureId,
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

export function useErrorPageNavigation(secureIds: string[] = []) {
	const navigate = useNavigate()
	const location = useLocation()
	const { project_id, error_secure_id } = useParams<Params>()
	const { showLeftPanel, setShowLeftPanel } = usePlayerConfiguration()
	const goToErrorGroup = useCallback(
		(secureId: string) => {
			navigate(
				{
					pathname: `/${project_id}/errors/${secureId}`,
					search: location.search,
				},
				{
					replace: true,
				},
			)
		},
		[navigate, project_id, location.search],
	)
	const currentSearchResultIndex = secureIds.findIndex(
		(secureId) => secureId === error_secure_id,
	)
	const canMoveForward =
		!!secureIds.length && currentSearchResultIndex < secureIds.length - 1
	const canMoveBackward = !!secureIds.length && currentSearchResultIndex > 0
	const nextSecureId = secureIds[currentSearchResultIndex + 1]
	const previousSecureId = secureIds[currentSearchResultIndex - 1]

	const [leftPanelWidth, setLeftPanelWidth] = useLocalStorage(
		LOCAL_STORAGE_PANEL_WIDTH_KEY,
		DEFAULT_PANEL_WIDTH,
	)

	return {
		leftPanelWidth,
		setLeftPanelWidth,
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
