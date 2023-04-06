import 'firebase/auth'

import { useAuthContext } from '@authentication/AuthContext'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { Header } from '@components/Header/Header'
import KeyboardShortcutsEducation from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetProjectDropdownOptionsQuery } from '@graph/hooks'
import { ErrorObject } from '@graph/schemas'
import { useNumericProjectId } from '@hooks/useProjectId'
import FrontPlugin from '@pages/FrontPlugin/FrontPlugin'
import {
	PlayerUIContextProvider,
	RightPanelView,
} from '@pages/Player/context/PlayerUIContext'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { usePlayerFullscreen } from '@pages/Player/utils/PlayerHooks'
import useLocalStorage from '@rehooks/local-storage'
import { GlobalContextProvider } from '@routers/ProjectRouter/context/GlobalContext'
import WithErrorSearchContext from '@routers/ProjectRouter/WithErrorSearchContext'
import WithSessionSearchContext from '@routers/ProjectRouter/WithSessionSearchContext'
import { auth } from '@util/auth'
import {
	useClientIntegrated,
	useLogsIntegrated,
	useServerIntegrated,
} from '@util/integrated'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useDialogState } from 'ariakit/dialog'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useToggle } from 'react-use'

import commonStyles from '../../Common.module.scss'
import ApplicationRouter from './ApplicationRouter'
import { ApplicationContextProvider } from './context/ApplicationContext'

export const ProjectRouter = () => {
	const { isLoggedIn } = useAuthContext()
	const [showKeyboardShortcutsGuide, toggleShowKeyboardShortcutsGuide] =
		useToggle(false)
	const [showBanner, toggleShowBanner] = useToggle(false)

	const { projectId } = useNumericProjectId()
	const { setLoadingState } = useAppLoadingContext()

	const { data, loading, error } = useGetProjectDropdownOptionsQuery({
		variables: { project_id: projectId! },
		skip: !isLoggedIn || !projectId, // Higher level routers decide when guests are allowed to hit this router
	})

	const { data: clientIntegration, loading: clientLoading } =
		useClientIntegrated()
	const { data: serverIntegration, loading: serverLoading } =
		useServerIntegrated()
	const { data: logsIntegration, loading: logsLoading } = useLogsIntegrated()
	const fullyIntegrated =
		!!clientIntegration?.integrated &&
		!!serverIntegration?.integrated &&
		!!logsIntegration?.integrated
	const integrated =
		!!clientIntegration?.integrated ||
		!!serverIntegration?.integrated ||
		!!logsIntegration?.integrated
	const integrationLoading = clientLoading || serverLoading || logsLoading

	useEffect(() => {
		const uri =
			import.meta.env.REACT_APP_PRIVATE_GRAPH_URI ??
			window.location.origin + '/private'
		let intervalId: NodeJS.Timeout

		auth.currentUser?.getIdToken().then((t) => {
			const fetchToken = () => {
				fetch(`${uri}/project-token/${projectId}`, {
					credentials: 'include',
					headers: {
						token: t,
					},
				})
			}
			if (projectId) {
				// Fetch a new token now and every 30 mins
				fetchToken()
			}
			intervalId = setInterval(fetchToken, 30 * 60 * 1000)
		})
		return () => {
			clearInterval(intervalId)
		}
	}, [projectId])

	useEffect(() => {
		if (data?.workspace?.id) {
			window.Intercom('update', {
				company: {
					id: data?.workspace.id,
					name: data?.workspace.name,
				},
			})
		}
	}, [data?.workspace])

	useEffect(() => {
		if (!isOnPrem) {
			window.Intercom('update', {
				hide_default_launcher: true,
			})
		}
		return () => {
			if (!isOnPrem) {
				window.Intercom('update', {
					hide_default_launcher: false,
				})
			}
		}
	}, [])

	useEffect(() => {
		if (!error) {
			setLoadingState((previousLoadingState) => {
				if (previousLoadingState !== AppLoadingState.EXTENDED_LOADING) {
					return loading || integrationLoading
						? AppLoadingState.LOADING
						: AppLoadingState.LOADED
				}

				return AppLoadingState.EXTENDED_LOADING
			})
		} else {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [error, integrationLoading, loading, setLoadingState])

	// if the user can join this workspace, give them that option via the ErrorState
	const joinableWorkspace = data?.joinable_workspaces
		?.filter((w) => w?.projects.map((p) => p?.id).includes(projectId))
		?.pop()

	const [rightPanelView, setRightPanelView] = useState<RightPanelView>(
		RightPanelView.Session,
	)

	const [activeEvent, setActiveEvent] = useState<HighlightEvent | undefined>(
		undefined,
	)

	const [activeError, setActiveError] = useState<ErrorObject | undefined>(
		undefined,
	)

	const [activeNetworkResource, setActiveNetworkResource] = useState<
		NetworkResource | undefined
	>(undefined)

	const [selectedRightPanelTab, setSelectedRightPanelTab] = useLocalStorage<
		'Events' | 'Threads' | 'Metadata'
	>('tabs-PlayerRightPanel-active-tab', 'Events')

	const { isPlayerFullscreen, setIsPlayerFullscreen, playerCenterPanelRef } =
		usePlayerFullscreen()

	const playerUIContext = {
		isPlayerFullscreen,
		setIsPlayerFullscreen,
		playerCenterPanelRef,
		selectedRightPanelTab,
		setSelectedRightPanelTab,
		activeEvent,
		setActiveEvent,
		activeError,
		setActiveError,
		activeNetworkResource,
		setActiveNetworkResource,
		rightPanelView,
		setRightPanelView,
	}

	const commandBarDialog = useDialogState()

	if (loading || integrationLoading) {
		return null
	}

	return (
		<GlobalContextProvider
			value={{
				showKeyboardShortcutsGuide,
				toggleShowKeyboardShortcutsGuide,
				showBanner,
				toggleShowBanner,
				commandBarDialog,
			}}
		>
			<ApplicationContextProvider
				value={{
					currentProject: data?.project ?? undefined,
					allProjects: data?.workspace?.projects ?? [],
					currentWorkspace: data?.workspace ?? undefined,
					workspaces: data?.workspaces ?? [],
				}}
			>
				<PlayerUIContextProvider value={playerUIContext}>
					<WithSessionSearchContext>
						<WithErrorSearchContext>
							<Routes>
								<Route
									path=":project_id/front"
									element={<FrontPlugin />}
								/>
								<Route
									path=":project_id/*"
									element={
										<>
											<Header
												integrated={integrated}
												fullyIntegrated={
													fullyIntegrated
												}
											/>
											<KeyboardShortcutsEducation />
											<div
												className={clsx(
													commonStyles.bodyWrapper,
													{
														[commonStyles.bannerShown]:
															showBanner,
													},
												)}
											>
												{/* Edge case: shareable links will still direct to this error page if you are logged in on a different project */}
												{isLoggedIn &&
												joinableWorkspace ? (
													<ErrorState
														shownWithHeader
														joinableWorkspace={
															joinableWorkspace
														}
													/>
												) : isLoggedIn &&
												  (error || !data?.project) ? (
													<ErrorState
														title="Enter this Workspace?"
														message={
															`Sadly, you don’t have access to the workspace 😢 ` +
															`Request access and we'll shoot an email to your workspace admin. ` +
															`Alternatively, feel free to make an account!`
														}
														shownWithHeader
														showRequestAccess
													/>
												) : (
													<ApplicationRouter
														clientIntegration={
															clientIntegration
														}
														serverIntegration={
															serverIntegration
														}
														logsIntegration={
															logsIntegration
														}
													/>
												)}
											</div>
										</>
									}
								/>
							</Routes>
						</WithErrorSearchContext>
					</WithSessionSearchContext>
				</PlayerUIContextProvider>
			</ApplicationContextProvider>
		</GlobalContextProvider>
	)
}
