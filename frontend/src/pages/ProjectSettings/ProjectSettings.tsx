import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import Tabs from '@components/Tabs/Tabs'
import { DangerForm } from '@pages/ProjectSettings/DangerForm/DangerForm'
import { ErrorSettingsForm } from '@pages/ProjectSettings/ErrorSettingsForm/ErrorSettingsForm'
import { ExcludedUsersForm } from '@pages/ProjectSettings/ExcludedUsersForm/ExcludedUsersForm'
import { NetworkRecordingForm } from '@pages/ProjectSettings/NetworkRecordingForm/NetworkRecordingForm'
import { RageClicksForm } from '@pages/ProjectSettings/RageClicksForm/RageClicksForm'
import SourcemapSettings from '@pages/WorkspaceSettings/SourcemapSettings/SourcemapSettings'
import analytics from '@util/analytics'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Route, Switch, useRouteMatch } from 'react-router-dom'

import styles from './ProjectSettings.module.scss'

const ProjectSettings = () => {
	const match = useRouteMatch()

	useEffect(() => analytics.page(), [match])

	return (
		<>
			<Helmet>
				<title>Project Settings</title>
			</Helmet>

			<LeadAlignLayout>
				<h2>Project Settings</h2>
				<Route
					path={`${match.path}/:tab?`}
					render={({ history, match: tabsMatch }) => {
						return (
							<div className={styles.tabsContainer}>
								<Switch>
									<Tabs
										activeKeyOverride={
											tabsMatch.params.tab || 'recording'
										}
										onChange={(key) => {
											history.push(`${match.url}/${key}`)
										}}
										noHeaderPadding
										noPadding
										id="settingsTabs"
										tabs={[
											{
												key: 'recording',
												title: 'Recording',
												panelContent: (
													<>
														<ExcludedUsersForm />
														<RageClicksForm />
														<NetworkRecordingForm />
													</>
												),
											},
											{
												key: 'errors',
												title: 'Errors',
												panelContent: (
													<>
														<ErrorSettingsForm />
														<SourcemapSettings />
													</>
												),
											},
											{
												key: 'general',
												title: 'General',
												panelContent: <DangerForm />,
											},
										]}
									/>
								</Switch>
							</div>
						)
					}}
				/>
			</LeadAlignLayout>
		</>
	)
}

export default ProjectSettings
