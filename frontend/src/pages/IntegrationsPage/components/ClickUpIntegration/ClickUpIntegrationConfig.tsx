import { Box, Button, Stack, Text } from '@highlight-run/ui/components'
import Card from '@components/Card/Card'
import Select from '@components/Select/Select'
import Table from '@components/Table/Table'
import { toast } from '@components/Toaster'
import { ClickUpProjectMappingInput } from '@graph/schemas'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import { useClickUpIntegration } from '@pages/IntegrationsPage/components/ClickUpIntegration/utils'
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
import clsx from 'clsx'
import React, { useEffect, useMemo } from 'react'

const CLICKUP_CLIENT_ID = import.meta.env.CLICKUP_CLIENT_ID

const ClickUpIntegrationConfig: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
	action,
}) => {
	switch (action) {
		case IntegrationAction.Setup:
			return (
				<ClickUpIntegrationSetup
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		case IntegrationAction.Settings:
			return (
				<ClickUpIntegrationSettings
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		case IntegrationAction.Disconnect:
			return (
				<ClickUpIntegrationDisconnect
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		default:
			throw new Error('Unknown integration action')
	}
}

const ClickUpIntegrationSetup: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
}) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { currentWorkspace } = useApplicationContext()
	const redirectUri = `${GetBaseURL()}/callback/clickup`

	return (
		<Stack gap="12">
			<Text color="moderate">Connect Highlight with ClickUp.</Text>
			<Box display="flex" justifyContent="flex-end" gap="8">
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track('IntegrationConfigurationCancel-ClickUp')
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
						analytics.track('IntegrationConfigurationSave-ClickUp')
						window.open(
							`https://app.clickup.com/api?client_id=${CLICKUP_CLIENT_ID}&redirect_uri=${redirectUri}&state=${btoaSafe(
								JSON.stringify({
									project_id: project_id,
									workspace_id: currentWorkspace?.id,
								}),
							)}`,
							'_blank',
						)
					}}
				>
					Connect Highlight with ClickUp
				</Button>
			</Box>
		</Stack>
	)
}

const ClickUpIntegrationDisconnect: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
}) => {
	const { removeIntegration } = useClickUpIntegration()

	return (
		<Stack gap="12">
			<Text color="moderate">
				Disconnecting ClickUp from Highlight will prevent you from
				creating tasks from future comments
			</Text>
			<Box display="flex" justifyContent="flex-end" gap="8">
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track('IntegrationDisconnectCancel-ClickUp')
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
						analytics.track('IntegrationDisconnectSave-ClickUp')
						removeIntegration()
							.then(() => {
								toast.success(
									'Disconnected the ClickUp integration!',
								)
								setModalOpen(false)
								setIntegrationEnabled(false)
							})
							.catch((reason: any) => {
								toast.error(String(reason))
							})
					}}
				>
					Disconnect ClickUp
				</Button>
			</Box>
		</Stack>
	)
}

export const ClickUpIntegrationSettings: React.FC<
	IntegrationConfigProps & { onCancel?: () => void; onSuccess?: () => void }
> = ({ setModalOpen, onCancel, onSuccess }) => {
	const { allProjects } = useApplicationContext()
	const [projectMap, projectMapSet, projectMapSetMulti, projectMapDelete] =
		useMap<string, string>()

	const { updateIntegration, settings } = useClickUpIntegration()

	useEffect(() => {
		if (settings.loading || !allProjects || allProjects?.length === 0) {
			return
		}

		const t = new Map<string, string>()
		for (const m of settings.project_mappings) {
			t.set(m.project_id, m.clickup_space_id)
		}
		projectMapSetMulti([...t.entries()])
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allProjects, projectMapSetMulti, settings.loading])

	if (settings.loading) {
		return null
	}

	const allSpaces = settings.clickup_teams.flatMap((t) =>
		t.spaces.map((s) => ({ id: s.id, label: `${t.name} > ${s.name}` })),
	)

	const highlightProjects: any[] = []
	if (!!allProjects) {
		for (const p of allProjects) {
			if (!!p) {
				highlightProjects.push({
					...p,
					onUpdateProjectLink: (label: string) => {
						const match = allSpaces.find((s) => s.label === label)

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
		allSpaces.map((p) => ({
			id: p.id,
			value: p.label,
			displayValue: p.label,
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
			title: 'ClickUp',
			dataIndex: 'clickUpSpaces',
			key: 'clickUpSpaces',
			width: '55%',
			render: (_: string, row: any) => {
				const clickUpSpaceId = projectMap.get(row.id)
				const opts = allSpaces.find((s) => s.id === clickUpSpaceId)
				return (
					<Select
						className="w-full"
						value={opts}
						onChange={row.onUpdateProjectLink}
						options={selectOptions}
						placeholder="ClickUp space"
						allowClear
					/>
				)
			},
		},
	]

	const projectMappings: ClickUpProjectMappingInput[] = []
	for (const [projectId, clickUpSpaceId] of projectMap.entries()) {
		// Skip for clickUpSpaceIds the user no longer has access to
		// (could be deleted or have had their permissions revoked)
		if (!allSpaces.find((s) => s.id === clickUpSpaceId)) {
			continue
		}

		// If this project hasn't been created yet, pass undefined as the project id
		projectMappings.push({
			project_id: projectId,
			clickup_space_id: clickUpSpaceId,
		})
	}

	const onSave = () => {
		updateIntegration({
			project_mappings: projectMappings,
		})
			.then(() => {
				onSuccess && onSuccess()
				toast.success('ClickUp settings saved!')
				setModalOpen(false)
			})
			.catch((reason: any) => {
				toast.error(String(reason))
			})
	}

	return (
		<Stack gap="12">
			<Text color="moderate">
				Select ClickUp spaces to use for each of your Highlight
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
						analytics.track('IntegrationConfigurationCancel-ClickUp')
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
						analytics.track('IntegrationConfigurationSave-ClickUp')
						onSave()
					}}
				>
					Update Settings
				</Button>
			</Box>
		</Stack>
	)
}

export default ClickUpIntegrationConfig
