import clsx from 'clsx'
import React, { useEffect } from 'react'

import { Box, Button, Stack, Text } from '@highlight-run/ui/components'
import Card from '@components/Card/Card'
import Select from '@components/Select/Select'
import Table from '@components/Table/Table'
import { toast } from '@components/Toaster'
import {
	IntegrationProjectMappingInput,
	IntegrationType,
} from '@graph/schemas'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import { useHeightIntegration } from '@pages/IntegrationsPage/components/HeightIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import useMap from '@util/useMap'
import { GetBaseURL } from '@util/window'
import { btoaSafe } from '@/util/string'

const HEIGHT_CLIENT_ID = import.meta.env.HEIGHT_CLIENT_ID

const HeightIntegrationConfig: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
	action,
}) => {
	switch (action) {
		case IntegrationAction.Setup:
			return (
				<HeightIntegrationSetup
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		case IntegrationAction.Settings:
			return (
				<HeightIntegrationSettings
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		case IntegrationAction.Disconnect:
			return (
				<HeightIntegrationDisconnect
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		default:
			throw new Error('Unknown integration action')
	}
}

const HeightIntegrationSetup: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
}) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { currentWorkspace } = useApplicationContext()
	const redirectUri = `${GetBaseURL()}/callback/height`

	return (
		<Stack gap="12">
			<Text color="moderate">Connect Highlight with Height.</Text>
			<Box display="flex" justifyContent="flex-end" gap="8">
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track('IntegrationConfigurationCancel-Height')
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="primary"
					emphasis="high"
					iconLeft={<Sparkles2Icon />}
					onClick={() => {
						analytics.track('IntegrationConfigurationSave-Height')
						window.open(
							`https://height.app/oauth/authorization?client_id=${HEIGHT_CLIENT_ID}&redirect_uri=${redirectUri}&access_types=appWorkspace&scope=api&state=${btoaSafe(
								JSON.stringify({
									project_id: project_id,
									workspace_id: currentWorkspace?.id,
								}),
							)}`,
							'_blank',
						)
					}}
				>
					Connect Highlight with Height
				</Button>
			</Box>
		</Stack>
	)
}

const HeightIntegrationDisconnect: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
}) => {
	const { removeIntegration } = useHeightIntegration()

	return (
		<Stack gap="12">
			<Text color="moderate">
				Disconnecting Height from Highlight will prevent you from
				creating tasks from future comments
			</Text>
			<Box display="flex" justifyContent="flex-end" gap="8">
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track('IntegrationDisconnectCancel-Height')
						setModalOpen(false)
						setIntegrationEnabled(true)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="danger"
					emphasis="high"
					iconLeft={<PlugIcon />}
					onClick={() => {
						analytics.track('IntegrationDisconnectSave-Height')
						removeIntegration()
							.then(() => {
								toast.success(
									'Disconnected the Height integration!',
								)
								setModalOpen(false)
								setIntegrationEnabled(false)
							})
							.catch((reason: any) => {
								toast.error(String(reason))
							})
					}}
				>
					Disconnect Height
				</Button>
			</Box>
		</Stack>
	)
}

export const HeightIntegrationSettings: React.FC<
	IntegrationConfigProps & { onCancel?: () => void; onSuccess?: () => void }
> = ({ setModalOpen, onCancel, onSuccess }) => {
	const { allProjects } = useApplicationContext()
	const [projectMap, projectMapSet, projectMapSetMulti, projectMapDelete] =
		useMap<string, string>()

	const { updateIntegration, settings } = useHeightIntegration()

	useEffect(() => {
		if (settings.loading || !allProjects || allProjects?.length === 0) {
			return
		}

		const t = new Map<string, string>()
		for (const m of settings.integration_project_mappings) {
			t.set(m.project_id, m.external_id)
		}
		projectMapSetMulti([...t.entries()])
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allProjects, projectMapSetMulti, settings.loading])

	if (settings.loading) {
		return null
	}

	const highlightProjects: any[] = []
	if (!!allProjects) {
		for (const p of allProjects) {
			if (!!p) {
				highlightProjects.push({
					...p,
					onUpdateProjectLink: (label: string) => {
						const match = settings.height_workspaces.find(
							(w) => w.name === label,
						)

						if (match === undefined) {
							projectMapDelete(p.id)
						} else {
							projectMapSet(p.id, match.id)
						}
					},
				})
			}
		}
	}

	const selectOptions =
		settings.height_workspaces.map((w) => ({
			id: w.id,
			value: w.name,
			displayValue: w.name,
		})) || []

	const tableColumns = [
		{
			title: 'Highlight',
			dataIndex: 'name',
			key: 'name',
			width: '35%',
			render: (value: string) => {
				return (
					<Box display="flex" gap="8">
						<Box display="flex" style={{ height: 20, width: 20 }}>
							<SvgHighlightLogoOnLight width={20} height={20} />
						</Box>
						<Box
							title={value}
							style={{
								maxWidth: 150,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{value}
						</Box>
					</Box>
				)
			},
		},
		{
			title: 'Arrow',
			render: () => (
				<Box display="flex" justifyContent="center">
					→
				</Box>
			),
		},
		{
			title: 'Height',
			dataIndex: 'heightWorkspaces',
			key: 'heightWorkspaces',
			width: '55%',
			render: (_: string, row: any) => {
				const heightWorkspaceId = projectMap.get(row.id)
				const selectedWorkspace = settings.height_workspaces.find(
					(w) => w.id === heightWorkspaceId,
				)
				const value = {
					id: selectedWorkspace?.id,
					value: selectedWorkspace?.id,
					label: selectedWorkspace?.name,
				}
				return (
					<Select
						className="w-full"
						value={value}
						onChange={row.onUpdateProjectLink}
						options={selectOptions}
						placeholder="Height workspace"
						allowClear
					/>
				)
			},
		},
	]

	const projectMappings: IntegrationProjectMappingInput[] = []
	for (const [projectId, externalId] of projectMap.entries()) {
		// If this project hasn't been created yet, pass undefined as the project id
		projectMappings.push({
			project_id: projectId,
			external_id: externalId,
		})
	}

	const onSave = () => {
		updateIntegration({
			project_mappings: projectMappings,
			integration_type: IntegrationType.Height,
		})
			.then(() => {
				onSuccess && onSuccess()
				toast.success('Height settings saved!')
				setModalOpen(false)
			})
			.catch((reason: any) => {
				toast.error(String(reason))
			})
	}

	return (
		<Stack gap="12">
			<Text color="moderate">
				Select Height workspaces to use for each of your Highlight
				projects.
			</Text>
			<Box my="12">
				<Card noPadding>
					<Table
						dataSource={highlightProjects}
						columns={tableColumns}
						pagination={false}
						showHeader={false}
						rowHasPadding
						smallPadding
					></Table>
				</Card>
			</Box>
			<Box display="flex" justifyContent="flex-end" gap="8">
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track('IntegrationConfigurationCancel-Height')
						onCancel && onCancel()
						setModalOpen(false)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="primary"
					emphasis="high"
					iconLeft={<Sparkles2Icon />}
					onClick={() => {
						analytics.track('IntegrationConfigurationSave-Height')
						onSave()
					}}
				>
					Update Settings
				</Button>
			</Box>
		</Stack>
	)
}

export default HeightIntegrationConfig
