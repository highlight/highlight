import Card from '@components/Card/Card'
import Select from '@components/Select/Select'
import Table from '@components/Table/Table'
import { toast } from '@components/Toaster'
import { IntegrationProjectMappingInput, IntegrationType } from '@graph/schemas'
import {
	Box,
	IconSolidHeight,
	IconSolidLogout,
	IconSolidSave,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import { useHeightIntegration } from '@pages/IntegrationsPage/components/HeightIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useParams } from '@util/react-router/useParams'
import useMap from '@util/useMap'
import { GetBaseURL } from '@util/window'
import React, { useEffect } from 'react'

import { Button } from '@/components/Button'
import { btoaSafe } from '@/util/string'

import styles from './HeightIntegrationConfig.module.css'

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

	const authUrl = `https://height.app/oauth/authorization?client_id=${HEIGHT_CLIENT_ID}&redirect_uri=${redirectUri}&access_types=appWorkspace&scope=api&state=${btoaSafe(
		JSON.stringify({
			project_id: project_id,
			workspace_id: currentWorkspace?.id,
		}),
	)}`

	return (
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				Connect Highlight with Height.
			</Text>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
			>
				<Button
					trackingId="IntegrationConfigurationCancel-Height"
					kind="secondary"
					size="medium"
					emphasis="medium"
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-Height"
					kind="primary"
					size="medium"
					emphasis="high"
					iconLeft={<IconSolidHeight />}
					onClick={() => {
						window.open(authUrl, '_blank', 'noreferrer')
					}}
				>
					Connect with Height
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
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				Disconnecting Height from Highlight will prevent you from
				creating tasks from future comments.
			</Text>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
			>
				<Button
					trackingId="IntegrationDisconnectCancel-Height"
					kind="secondary"
					size="medium"
					emphasis="medium"
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(true)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationDisconnectSave-Height"
					kind="danger"
					size="medium"
					emphasis="high"
					iconLeft={<IconSolidLogout />}
					onClick={() => {
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
					<div className="flex gap-2">
						<div className="h-[20px] w-[20px]">
							<SvgHighlightLogoOnLight width={20} height={20} />
						</div>
						<div
							title={value}
							className="max-w-[150px] overflow-hidden text-ellipsis break-normal"
						>
							{value}
						</div>
					</div>
				)
			},
		},
		{
			title: 'Arrow',
			render: () => <div className="justify-center">→</div>,
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
					<div className={styles.select}>
						<Select
							className="w-full"
							value={value}
							onChange={row.onUpdateProjectLink}
							options={selectOptions}
							placeholder="Height workspace"
							allowClear
						/>
					</div>
				)
			},
		},
	]

	const projectMappings: IntegrationProjectMappingInput[] = []
	for (const [projectId, externalId] of projectMap.entries()) {
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
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				Select Height workspaces to use for each of your Highlight
				projects.
			</Text>
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
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
			>
				<Button
					trackingId="IntegrationConfigurationCancel-Height"
					kind="secondary"
					size="medium"
					emphasis="medium"
					onClick={() => {
						onCancel && onCancel()
						setModalOpen(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-Height"
					kind="primary"
					size="medium"
					emphasis="high"
					iconLeft={<IconSolidSave />}
					onClick={onSave}
				>
					Update settings
				</Button>
			</Box>
		</Stack>
	)
}

export default HeightIntegrationConfig
