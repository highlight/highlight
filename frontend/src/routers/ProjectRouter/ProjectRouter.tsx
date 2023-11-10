import 'firebase/compat/auth'

import { ApolloError } from '@apollo/client'
import { useAuthContext } from '@authentication/AuthContext'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { Header } from '@components/Header/Header'
import KeyboardShortcutsEducation from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetProjectDropdownOptionsQuery } from '@graph/hooks'
import { ErrorObject, Maybe, Project, Workspace } from '@graph/schemas'
import { Ariakit } from '@highlight-run/ui'
import { useNumericProjectId } from '@hooks/useProjectId'
import FrontPlugin from '@pages/FrontPlugin/FrontPlugin'
import {
	PlayerUIContextProvider,
	RightPanelView,
	RightPlayerTab,
} from '@pages/Player/context/PlayerUIContext'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import { usePlayerFullscreen } from '@pages/Player/utils/PlayerHooks'
import useLocalStorage from '@rehooks/local-storage'
import { GlobalContextProvider } from '@routers/ProjectRouter/context/GlobalContext'
import { auth } from '@util/auth'
import { setIndexedDBEnabled } from '@util/db'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useToggle } from 'react-use'

import { PRIVATE_GRAPH_URI } from '@/constants'
import {
	useClientIntegration,
	useLogsIntegration,
	useServerIntegration,
} from '@/util/integrated'

import commonStyles from '../../Common.module.css'
import ApplicationRouter from './ApplicationRouter'

export const ProjectRouter = () => {
	const { isLoggedIn } = useAuthContext()
	const [showKeyboardShortcutsGuide, toggleShowKeyboardShortcutsGuide] =
		useToggle(false)
	const [showBanner, toggleShowBanner] = useToggle(false)

	const { projectId } = useNumericProjectId()
	const { setLoadingState } = useAppLoadingContext()

	const { data, error } = useGetProjectDropdownOptionsQuery({
		variables: { project_id: projectId! },
		skip: !isLoggedIn || !projectId, // Higher level routers decide when guests are allowed to hit this router
	})

	// Can we avoid calling these if we are viewing a shared session?
	const clientIntegration = useClientIntegration()
	const serverIntegration = useServerIntegration()
	const logsIntegration = useLogsIntegration()
	const fullyIntegrated =
		clientIntegration.integrated &&
		serverIntegration.integrated &&
		logsIntegration.integrated

	// disable indexedDB for 5403
	useEffect(() => {
		if (projectId === '5403') {
			setIndexedDBEnabled(false)
		}
	}, [projectId])

	useEffect(() => {
		let intervalId: NodeJS.Timeout

		auth.currentUser?.getIdToken().then((t) => {
			const fetchToken = () => {
				fetch(`${PRIVATE_GRAPH_URI}/project-token/${projectId}`, {
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
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	// if the user can join this workspace, give them that option via the ErrorState
	const joinableWorkspace = data?.joinable_workspaces
		?.filter((w) => w?.projects.map((p) => p?.id).includes(projectId))
		?.pop()

	const [rightPanelView, setRightPanelView] = useLocalStorage<RightPanelView>(
		'tabs-right-panel-view',
		RightPanelView.Session,
	)

	const [activeEvent, setActiveEvent] = useState<HighlightEvent | undefined>(
		undefined,
	)

	const [activeEventIndex, setActiveEventIndex] = useState<number>(0)

	const [searchItem, setSearchItem] = useState<string | undefined>('')

	const [activeError, setActiveError] = useState<ErrorObject | undefined>(
		undefined,
	)

	const [selectedRightPanelTab, setSelectedRightPanelTab] =
		useLocalStorage<RightPlayerTab>(
			'tabs-PlayerRightPanel-active-tab',
			'Events',
		)

	const { isPlayerFullscreen, setIsPlayerFullscreen, playerCenterPanelRef } =
		usePlayerFullscreen()

	const commandBarDialog = Ariakit.useDialogStore()

	const playerUIContext = {
		isPlayerFullscreen,
		setIsPlayerFullscreen,
		playerCenterPanelRef,
		selectedRightPanelTab,
		setSelectedRightPanelTab,
		activeEvent,
		setActiveEvent,
		activeEventIndex,
		setActiveEventIndex,
		searchItem,
		setSearchItem,
		activeError,
		setActiveError,
		rightPanelView,
		setRightPanelView,
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
			<PlayerUIContextProvider value={playerUIContext}>
				<Routes>
					<Route path=":project_id/front" element={<FrontPlugin />} />
					<Route
						path=":project_id/*"
						element={
							<>
								<Header fullyIntegrated={fullyIntegrated} />
								<KeyboardShortcutsEducation />
								<div
									className={clsx(commonStyles.bodyWrapper, {
										[commonStyles.bannerShown]: showBanner,
									})}
								>
									<ApplicationOrError
										error={error}
										joinableWorkspace={joinableWorkspace}
									/>
								</div>
							</>
						}
					/>
				</Routes>
			</PlayerUIContextProvider>
		</GlobalContextProvider>
	)
}

type JoinableWorkspace = Maybe<
	{
		__typename?: 'Workspace' | undefined
	} & Pick<Workspace, 'id' | 'name'> & {
			projects: Maybe<
				{
					__typename?: 'Project' | undefined
				} & Pick<Project, 'id'>
			>[]
		}
>

function ApplicationOrError({
	joinableWorkspace,
	error,
}: {
	error: ApolloError | undefined
	joinableWorkspace: JoinableWorkspace | undefined
}) {
	const { isLoggedIn } = useAuthContext()

	// Edge case: shareable links will still direct to this error page if you are logged in on a different project
	switch (true) {
		case isLoggedIn && !!joinableWorkspace:
			return (
				<ErrorState
					shownWithHeader
					joinableWorkspace={joinableWorkspace}
				/>
			)

		case isLoggedIn && !!error:
			return (
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
			)

		default:
			return <ApplicationRouter />
	}
}
