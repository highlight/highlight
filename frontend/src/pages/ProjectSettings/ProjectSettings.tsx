import Tabs from '@components/Tabs/Tabs'
import { DangerForm } from '@pages/ProjectSettings/DangerForm/DangerForm'
import { ErrorFiltersForm } from '@pages/ProjectSettings/ErrorFiltersForm/ErrorFiltersForm'
import { ErrorSettingsForm } from '@pages/ProjectSettings/ErrorSettingsForm/ErrorSettingsForm'
import { ExcludedUsersForm } from '@pages/ProjectSettings/ExcludedUsersForm/ExcludedUsersForm'
import { FilterExtensionForm } from '@pages/ProjectSettings/FilterExtensionForm/FilterExtensionForm'
import { NetworkRecordingForm } from '@pages/ProjectSettings/NetworkRecordingForm/NetworkRecordingForm'
import { RageClicksForm } from '@pages/ProjectSettings/RageClicksForm/RageClicksForm'
import SourcemapSettings from '@pages/WorkspaceSettings/SourcemapSettings/SourcemapSettings'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'

import LeadAlignLayout from '@/components/layout/LeadAlignLayout'
import { FilterSessionsWithoutErrorForm } from '@/pages/ProjectSettings/FilterSessionsWithoutErrorForm/FilterSessionsWithoutErrorForm'

import styles from './ProjectSettings.module.scss'

const ProjectSettings = () => {
	const navigate = useNavigate()
	const params = useParams()

	return (
		<>
			<Helmet>
				<title>Project Settings</title>
			</Helmet>

			<LeadAlignLayout>
				<h2>Project Settings</h2>
				<div className={styles.tabsContainer}>
					<Tabs
						activeKeyOverride={params.tab ?? 'recording'}
						onChange={(key) => {
							navigate(`/${params.project_id}/settings/${key}`)
						}}
						noHeaderPadding
						noPadding
						id="settingsTabs"
						tabs={[
							{
								key: 'recording',
								title: 'Session Replay',
								panelContent: (
									<>
										<ExcludedUsersForm />
										<FilterSessionsWithoutErrorForm />
										<RageClicksForm />
										<NetworkRecordingForm />
									</>
								),
							},
							{
								key: 'errors',
								title: 'Error Monitoring',
								panelContent: (
									<>
										<ErrorSettingsForm />
										<FilterExtensionForm />
										<ErrorFiltersForm />
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
				</div>
			</LeadAlignLayout>
		</>
	)
}

export default ProjectSettings
