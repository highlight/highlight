import Tabs from '@components/Tabs/Tabs'
import { Box, Heading, Stack, Text } from '@highlight-run/ui'
import { DangerForm } from '@pages/ProjectSettings/DangerForm/DangerForm'
import { ErrorFiltersForm } from '@pages/ProjectSettings/ErrorFiltersForm/ErrorFiltersForm'
import { ErrorSettingsForm } from '@pages/ProjectSettings/ErrorSettingsForm/ErrorSettingsForm'
import { ExcludedUsersForm } from '@pages/ProjectSettings/ExcludedUsersForm/ExcludedUsersForm'
import { FilterExtensionForm } from '@pages/ProjectSettings/FilterExtensionForm/FilterExtensionForm'
import { NetworkRecordingForm } from '@pages/ProjectSettings/NetworkRecordingForm/NetworkRecordingForm'
import { RageClicksForm } from '@pages/ProjectSettings/RageClicksForm/RageClicksForm'
import SourcemapSettings from '@pages/WorkspaceSettings/SourcemapSettings/SourcemapSettings'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'

import BorderBox from '@/components/BorderBox/BorderBox'
import { Button } from '@/components/Button'
import {
	CircularSpinner,
	LoadingRightPanel,
} from '@/components/Loading/Loading'
import {
	useEditProjectSettingsMutation,
	useGetProjectQuery,
	useGetProjectSettingsQuery,
} from '@/graph/generated/hooks'
import {
	GetProjectSettingsQuery,
	namedOperations,
} from '@/graph/generated/operations'
import { AutoresolveStaleErrorsForm } from '@/pages/ProjectSettings/AutoresolveStaleErrorsForm/AutoresolveStaleErrorsForm'
import { FilterSessionsWithoutErrorForm } from '@/pages/ProjectSettings/FilterSessionsWithoutErrorForm/FilterSessionsWithoutErrorForm'
import { ProjectSettingsContextProvider } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import styles from './ProjectSettings.module.scss'

const ProjectSettings = () => {
	const navigate = useNavigate()
	const { project_id, ...params } = useParams()
	const [allProjectSettings, setAllProjectSettings] =
		useState<GetProjectSettingsQuery>()

	const { data: projectData } = useGetProjectQuery({
		variables: {
			id: project_id!,
		},
		skip: !project_id,
	})
	const { data, loading } = useGetProjectSettingsQuery({
		variables: {
			projectId: project_id!,
		},
		skip: !project_id,
	})

	const [editProjectSettings, { loading: editProjectSettingsLoading }] =
		useEditProjectSettingsMutation({
			refetchQueries: [namedOperations.Query.GetProjectSettings],
		})

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (!project_id) {
			return
		}
		editProjectSettings({
			variables: {
				projectId: project_id!,
				...allProjectSettings?.projectSettings,
			},
		}).then(() => {
			message.success('Updated session replay settings!', 5)
		})
	}

	useEffect(() => {
		if (!loading) {
			setAllProjectSettings(data)
		}
	}, [data, projectData, loading])

	if (loading) {
		return <LoadingRightPanel show={true} />
	}

	return (
		<>
			<Helmet>
				<title>Project Settings</title>
			</Helmet>

			<Box>
				<Box style={{ maxWidth: 560 }} my="40" mx="auto">
					<Heading mt="16" level="h4">
						Project Settings
					</Heading>
					<div className={styles.tabsContainer}>
						<ProjectSettingsContextProvider
							value={{
								allProjectSettings,
								setAllProjectSettings,
								loading,
							}}
						>
							<Tabs
								activeKeyOverride={params.tab ?? 'sessions'}
								onChange={(key) => {
									navigate(`/${project_id}/settings/${key}`)
								}}
								noHeaderPadding
								noPadding
								id="settingsTabs"
								tabs={[
									{
										key: 'sessions',
										title: 'Session replay',
										panelContent: (
											<Stack>
												<Box
													display="flex"
													gap="8"
													justifyContent="space-between"
													alignItems="center"
												>
													<Text
														size="large"
														weight="bold"
													>
														Session replay
													</Text>
													<Button
														onClick={onSubmit}
														trackingId="ProjectSettingsUpdate"
													>
														{editProjectSettingsLoading ? (
															<CircularSpinner
																style={{
																	fontSize: 18,
																	color: 'var(--text-primary-inverted)',
																}}
															/>
														) : (
															'Save changes'
														)}
													</Button>
												</Box>
												<ExcludedUsersForm />
												<FilterSessionsWithoutErrorForm />
												<RageClicksForm />
												<NetworkRecordingForm />
											</Stack>
										),
									},
									{
										key: 'errors',
										title: 'Error monitoring',
										panelContent: (
											<Stack>
												<Box
													display="flex"
													gap="8"
													justifyContent="space-between"
													alignItems="center"
												>
													<Text
														size="large"
														weight="bold"
													>
														Error monitoring
													</Text>
													<Button
														onClick={onSubmit}
														trackingId="ProjectSettingsUpdate"
													>
														{editProjectSettingsLoading ? (
															<CircularSpinner
																style={{
																	fontSize: 18,
																	color: 'var(--text-primary-inverted)',
																}}
															/>
														) : (
															'Save changes'
														)}
													</Button>
												</Box>
												<BorderBox>
													<Stack gap="8">
														<ErrorSettingsForm />
														<Box borderTop="dividerWeak" />
														<ErrorFiltersForm />
													</Stack>
												</BorderBox>
												<FilterExtensionForm />
												<SourcemapSettings />
												<AutoresolveStaleErrorsForm />
											</Stack>
										),
									},
									{
										key: 'general',
										title: 'General',
										panelContent: <DangerForm />,
									},
								]}
							/>
						</ProjectSettingsContextProvider>
					</div>
				</Box>
			</Box>
		</>
	)
}

export default ProjectSettings
