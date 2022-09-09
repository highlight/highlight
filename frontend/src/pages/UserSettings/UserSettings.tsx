import { Header } from '@components/Header/Header'
import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetProjectDropdownOptionsQuery } from '@graph/hooks'
import { ApplicationContextProvider } from '@routers/OrgRouter/ApplicationContext'
import { GlobalContextProvider } from '@routers/OrgRouter/context/GlobalContext'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'

import Auth from './Auth/Auth'
import styles from './UserSettings.module.scss'

const UserSettings: React.FC = () => {
	const { setLoadingState } = useAppLoadingContext()
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { data, loading } = useGetProjectDropdownOptionsQuery({
		variables: { project_id },
	})

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	if (loading) {
		return null
	}

	return (
		<>
			<Helmet>
				<title>User Settings</title>
			</Helmet>
			{/* Need these contexts to render Header */}
			<GlobalContextProvider
				value={{
					showKeyboardShortcutsGuide: false,
					toggleShowKeyboardShortcutsGuide: () => null,
					showBanner: false,
					toggleShowBanner: () => null,
				}}
			>
				<ApplicationContextProvider
					value={{
						currentProject: undefined,
						allProjects: data?.workspace?.projects || [],
						currentWorkspace: data?.workspace || undefined,
						workspaces: data?.workspaces || [],
					}}
				>
					<Header />
					<div>
						<LeadAlignLayout>
							<div>
								<h2 className={styles.header}>User Settings</h2>
							</div>

							<Auth />
						</LeadAlignLayout>
					</div>
				</ApplicationContextProvider>
			</GlobalContextProvider>
		</>
	)
}

export default UserSettings
