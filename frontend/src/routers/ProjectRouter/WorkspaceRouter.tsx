import { useAuthContext } from '@authentication/AuthContext'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { Header } from '@components/Header/Header'
import KeyboardShortcutsEducation from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetWorkspaceDropdownOptionsQuery } from '@graph/hooks'
import { Ariakit } from '@highlight-run/ui'
import { GlobalContextProvider } from '@routers/ProjectRouter/context/GlobalContext'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useToggle } from 'react-use'

import { SettingsRouter } from '@/pages/SettingsRouter/SettingsRouter'

import commonStyles from '../../Common.module.css'

export const WorkspaceRouter = () => {
	const { isLoggedIn } = useAuthContext()
	const [showKeyboardShortcutsGuide, toggleShowKeyboardShortcutsGuide] =
		useToggle(false)
	const [showBanner, toggleShowBanner] = useToggle(false)

	const { workspace_id } = useParams<{
		workspace_id: string
	}>()
	const { setLoadingState } = useAppLoadingContext()

	const { data, loading } = useGetWorkspaceDropdownOptionsQuery({
		variables: { workspace_id: workspace_id ?? '' },
		skip: !isLoggedIn || !workspace_id, // Higher level routers decide when guests are allowed to hit this router
	})

	useEffect(() => {
		if (isLoggedIn) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [isLoggedIn, setLoadingState])

	const commandBarDialog = Ariakit.useDialogStore()

	if (loading) {
		return null
	}

	// if the user can join this workspace, give them that option via the ErrorState
	const joinableWorkspace = data?.joinable_workspaces
		?.filter((w) => w?.id === workspace_id)
		?.pop()

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
			<Header />
			<KeyboardShortcutsEducation />
			<div className={commonStyles.bodyWrapper}>
				{isLoggedIn && joinableWorkspace ? (
					<ErrorState
						shownWithHeader
						joinableWorkspace={joinableWorkspace}
					/>
				) : isLoggedIn && data?.workspace === null ? (
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
