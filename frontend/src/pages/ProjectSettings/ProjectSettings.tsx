import { toast } from '@components/Toaster'
import { Box, Heading, Stack, Tabs, Text } from '@highlight-run/ui/components'
import { DangerForm } from '@pages/ProjectSettings/DangerForm/DangerForm'
import { ErrorFiltersForm } from '@pages/ProjectSettings/ErrorFiltersForm/ErrorFiltersForm'
import { ErrorSettingsForm } from '@pages/ProjectSettings/ErrorSettingsForm/ErrorSettingsForm'
import { ExcludedUsersForm } from '@pages/ProjectSettings/ExcludedUsersForm/ExcludedUsersForm'
import { FilterExtensionForm } from '@pages/ProjectSettings/FilterExtensionForm/FilterExtensionForm'
import { ProjectFilters } from '@pages/ProjectSettings/ProjectFilters/ProjectFilters'
import { RageClicksForm } from '@pages/ProjectSettings/RageClicksForm/RageClicksForm'
import { ServicesTable } from '@pages/ProjectSettings/ServicesTable/ServicesTable'
import { SessionExportForm } from '@pages/ProjectSettings/SessionExportForm/SessionExportForm'
import SourcemapSettings from '@pages/WorkspaceSettings/SourcemapSettings/SourcemapSettings'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useParams } from '@util/react-router/useParams'
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
	useGetWorkspaceSettingsQuery,
} from '@/graph/generated/hooks'
import {
	GetProjectSettingsQuery,
	namedOperations,
} from '@/graph/generated/operations'
import { AutoresolveStaleErrorsForm } from '@/pages/ProjectSettings/AutoresolveStaleErrorsForm/AutoresolveStaleErrorsForm'
import { ProjectSettingsContextProvider } from '@/pages/ProjectSettings/ProjectSettingsContext/ProjectSettingsContext'

import { SessionFiltersCallout } from './SessionFiltersCallout/SessionFiltersCallout'

enum ProjectSettingsTabs {
	General = 'general',
	Sessions = 'sessions',
	Errors = 'errors',
	Services = 'services',
	Filters = 'filters',
}

const ProjectSettings = () => {
	const navigate = useNavigate()
	const { project_id, ...params } = useParams<{
		project_id: string
		tab: ProjectSettingsTabs
		[key: string]: string
	}>()
	const [allProjectSettings, setAllProjectSettings] =
		useState<GetProjectSettingsQuery>()
	const { currentWorkspace } = useApplicationContext()
	const { data: workspaceSettingsData } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id,
	})

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

	const onSubmit =
		(tabTitle: string) => (e: { preventDefault: () => void }) => {
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
				toast.success(`Updated ${tabTitle} settings!`, {
					duration: 5000,
				})
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

			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<Heading mt="16" level="h4">
					Project Settings
				</Heading>
				<Box mt="24">
					<ProjectSettingsContextProvider
						value={{
							allProjectSettings,
							setAllProjectSettings,
							loading,
						}}
					>
						<Tabs<ProjectSettingsTabs>
							selectedId={
								params.tab ?? ProjectSettingsTabs.Sessions
							}
							onChange={(id) => {
								navigate(`/${project_id}/settings/${id}`)
							}}
						>
							<Tabs.List>
								<Tabs.Tab id={ProjectSettingsTabs.General}>
									General
								</Tabs.Tab>
								<Tabs.Tab id={ProjectSettingsTabs.Sessions}>
									Session replay
								</Tabs.Tab>
								<Tabs.Tab id={ProjectSettingsTabs.Errors}>
									Error monitoring
								</Tabs.Tab>
								<Tabs.Tab id={ProjectSettingsTabs.Services}>
									Services
								</Tabs.Tab>
								<Tabs.Tab id={ProjectSettingsTabs.Filters}>
									Filters
								</Tabs.Tab>
							</Tabs.List>
							<Box mt="24">
								<Tabs.Panel id={ProjectSettingsTabs.General}>
									<DangerForm />
								</Tabs.Panel>
								<Tabs.Panel id={ProjectSettingsTabs.Sessions}>
									<Stack>
										<Box
											display="flex"
											gap="8"
											justifyContent="space-between"
											alignItems="center"
										>
											<Text size="large" weight="bold">
												Session replay
											</Text>
											<Button
												onClick={onSubmit(
													'session replay',
												)}
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
										<SessionFiltersCallout />
										<RageClicksForm />
										{workspaceSettingsData
											?.workspaceSettings
											?.enable_session_export ? (
											<SessionExportForm />
										) : null}
									</Stack>
								</Tabs.Panel>
								<Tabs.Panel id={ProjectSettingsTabs.Errors}>
									<Stack>
										<Box
											display="flex"
											gap="8"
											justifyContent="space-between"
											alignItems="center"
										>
											<Text size="large" weight="bold">
												Error monitoring
											</Text>
											<Button
												onClick={onSubmit(
													'error monitoring',
												)}
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
								</Tabs.Panel>
								<Tabs.Panel id={ProjectSettingsTabs.Services}>
									<ServicesTable />
								</Tabs.Panel>
								<Tabs.Panel id={ProjectSettingsTabs.Filters}>
									<ProjectFilters />
								</Tabs.Panel>
							</Box>
						</Tabs>
					</ProjectSettingsContextProvider>
				</Box>
			</Box>
		</>
	)
}

export default ProjectSettings
