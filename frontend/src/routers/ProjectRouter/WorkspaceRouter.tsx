import { useAuthContext } from '@authentication/AuthContext'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { Header } from '@components/Header/Header'
import KeyboardShortcutsEducation from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { GlobalContextProvider } from '@routers/ProjectRouter/context/GlobalContext'
import { useParams } from '@util/react-router/useParams'
import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useToggle } from 'react-use'

import { useLocalStorageProjectId } from '@/hooks/useProjectId'
import { SettingsRouter } from '@/pages/SettingsRouter/SettingsRouter'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

import commonStyles from '../../Common.module.css'

export const WorkspaceRouter = () => {
	const { isLoggedIn } = useAuthContext()
	const [showKeyboardShortcutsGuide, toggleShowKeyboardShortcutsGuide] =
		useToggle(false)
	const {
		projectId: localStorageProjectId,
		setProjectId: setLocalStorageProjectId,
	} = useLocalStorageProjectId()
	const [showBanner, toggleShowBanner] = useToggle(false)

	const { workspace_id } = useParams<{
		workspace_id: string
	}>()
	const { setLoadingState } = useAppLoadingContext()

	const { allProjects, joinableWorkspaces, loading, currentWorkspace } =
		useApplicationContext()

	useEffect(() => {
		if (isLoggedIn) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [isLoggedIn, setLoadingState])

	useEffect(() => {
		const projectsLoaded = allProjects?.length
		const projectInWorkspace = allProjects?.find(
			(p) => String(p?.id) === String(localStorageProjectId),
		)

		if (projectsLoaded && !projectInWorkspace) {
			setLocalStorageProjectId('')
		}
	}, [allProjects, localStorageProjectId, setLocalStorageProjectId])

	if (loading) {
		return null
	}

	// if the user can join this workspace, give them that option via the ErrorState
	const joinableWorkspace = joinableWorkspaces
		?.filter((w) => w?.id === workspace_id)
		?.pop()

	return (
		<GlobalContextProvider
			value={{
				showKeyboardShortcutsGuide,
				toggleShowKeyboardShortcutsGuide,
				showBanner,
				toggleShowBanner,
			}}
		>
			<Header />
			<KeyboardShortcutsEducation />
			<div className={commonStyles.bodyWrapper}>
				{isLoggedIn && joinableWorkspace ? (
					<ErrorState
						shownWithHeader
						joinableWorkspace={joinableWorkspace}
					/>
				) : isLoggedIn && !currentWorkspace ? (
					<ErrorState
						title="Enter this Workspace?"
						message={
							`Sadly, you don’t have access to the workspace 😢 ` +
							`Request access and we'll shoot an email to your workspace admin. ` +
							`Alternatively, feel free to make an account!`
						}
						shownWithHeader
					/>
				) : (
					<Routes>
						<Route path="*" element={<SettingsRouter />} />
					</Routes>
				)}
			</div>
		</GlobalContextProvider>
	)
}
