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
import FrontPlugin from '@pages/FrontPlugin/FrontPlugin'
import {
	PlayerUIContextProvider,
	RightPanelView,
} from '@pages/Player/context/PlayerUIContext'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { usePlayerFullscreen } from '@pages/Player/utils/PlayerHooks'
import useLocalStorage from '@rehooks/local-storage'
import { GlobalContextProvider } from '@routers/OrgRouter/context/GlobalContext'
import WithErrorSearchContext from '@routers/OrgRouter/WithErrorSearchContext'
import WithSessionSearchContext from '@routers/OrgRouter/WithSessionSearchContext'
import { useIntegrated } from '@util/integrated'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useParams } from '@util/react-router/useParams'
import classNames from 'classnames'
import Firebase from 'firebase/app'
import React, { useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import { useToggle } from 'react-use'

import commonStyles from '../../Common.module.scss'
import OnboardingBubble from '../../components/OnboardingBubble/OnboardingBubble'
import { ApplicationContextProvider } from './ApplicationContext'
import ApplicationRouter from './ApplicationRouter'

export const ProjectRouter = () => {
	const { isLoggedIn } = useAuthContext()
	const [showKeyboardShortcutsGuide, toggleShowKeyboardShortcutsGuide] =
		useToggle(false)
	const [showBanner, toggleShowBanner] = useToggle(false)
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { setLoadingState } = useAppLoadingContext()

	const { data, loading, error } = useGetProjectDropdownOptionsQuery({
		variables: { project_id },
		skip: !isLoggedIn, // Higher level routers decide when guests are allowed to hit this router
	})

	const { integrated, loading: integratedLoading } = useIntegrated()
	const [hasFinishedOnboarding] = useLocalStorage(
		`highlight-finished-onboarding-${project_id}`,
		false,
	)

	useEffect(() => {
		const uri =
			import.meta.env.REACT_APP_PRIVATE_GRAPH_URI ??
			window.location.origin + '/private'
		let intervalId: NodeJS.Timeout
		Firebase.auth()
			.currentUser?.getIdToken()
			.then((t) => {
				const fetchToken = () => {
					fetch(`${uri}/project-token/${project_id}`, {
						credentials: 'include',
						headers: {
							token: t,
						},
					})
				}
				// Fetch a new token now and every 30 mins
				fetchToken()
				intervalId = setInterval(fetchToken, 30 * 60 * 1000)
			})
		return () => {
			clearInterval(intervalId)
		}
	}, [project_id])

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
					return loading || integratedLoading
						? AppLoadingState.LOADING
						: AppLoadingState.LOADED
				}

				return AppLoadingState.EXTENDED_LOADING
			})
		} else {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [error, integratedLoading, loading, setLoadingState])

	// if the user can join this workspace, give them that option via the ErrorState
	const joinableWorkspace = data?.joinable_workspaces
		?.filter((w) => w?.projects.map((p) => p?.id).includes(project_id))
		?.pop()

	const [detailedPanel, setDetailedPanel] = useState<
		| {
				title: string | React.ReactNode
				content: React.ReactNode
				id: string
		  }
		| undefined
	>(undefined)

	const [rightPanelView, setRightPanelView] = useState<RightPanelView>(
		RightPanelView.SESSION,
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
		detailedPanel,
		setDetailedPanel,
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

	if (loading || integratedLoading) {
		return null
	}

	return (
		<GlobalContextProvider
			value={{
				showKeyboardShortcutsGuide,
				toggleShowKeyboardShortcutsGuide,
				showBanner,
				toggleShowBanner,
			}}
		>
			<ApplicationContextProvider
				value={{
					currentProject: data?.project || undefined,
					allProjects: data?.workspace?.projects || [],
					currentWorkspace: data?.workspace || undefined,
					workspaces: data?.workspaces || [],
				}}
			>
				<PlayerUIContextProvider value={playerUIContext}>
					<WithSessionSearchContext>
						<WithErrorSearchContext>
							<Switch>
								<Route path="/:project_id/front" exact>
									<FrontPlugin />
								</Route>
								<Route>
									<Header />
									<KeyboardShortcutsEducation />
									<div
										className={classNames(
											commonStyles.bodyWrapper,
											{
												[commonStyles.bannerShown]:
													showBanner,
											},
										)}
									>
										{/* Edge case: shareable links will still direct to this error page if you are logged in on a different project */}
										{isLoggedIn && joinableWorkspace ? (
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
												message={`
                        Sadly, you don’t have access to the workspace 😢
                        Request access and we'll shoot an email to your workspace admin.
                        Alternatively, feel free to make an account!
                        `}
												shownWithHeader
												showRequestAccess
											/>
										) : (
											<>
												{isLoggedIn &&
													!hasFinishedOnboarding && (
														<>
															<OnboardingBubble />
														</>
													)}
												<ApplicationRouter
													integrated={integrated}
												/>
											</>
										)}
									</div>
								</Route>
							</Switch>
						</WithErrorSearchContext>
					</WithSessionSearchContext>
				</PlayerUIContextProvider>
			</ApplicationContextProvider>
		</GlobalContextProvider>
	)
}
