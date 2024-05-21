import Button from '@components/Button/Button/Button'
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
import { useParams } from '@util/react-router/useParams'
import useMap from '@util/useMap'
import { GetBaseURL } from '@util/window'
import clsx from 'clsx'
import React, { useEffect } from 'react'

import styles from './ClickUpIntegrationConfig.module.css'

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
		<>
			<p className={styles.modalSubTitle}>
				Connect Highlight with ClickUp.
			</p>
			<footer>
				<Button
					trackingId="IntegrationConfigurationCancel-ClickUp"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-ClickUp"
					className={styles.modalBtn}
					type="primary"
					target="_blank"
					href={`https://app.clickup.com/api?client_id=${CLICKUP_CLIENT_ID}&redirect_uri=${redirectUri}&state=${btoa(
						JSON.stringify({
							project_id: project_id,
							workspace_id: currentWorkspace?.id,
						}),
					)}`}
					rel="noreferrer"
				>
					<span className={styles.modalBtnText}>
						<Sparkles2Icon className={styles.modalBtnIcon} />
						<span style={{ marginTop: 4 }}>
							Connect Highlight with ClickUp
						</span>
					</span>
				</Button>
			</footer>
		</>
	)
}

const ClickUpIntegrationDisconnect: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
}) => {
	const { removeIntegration } = useClickUpIntegration()

	return (
		<>
			<p className={styles.modalSubTitle}>
				Disconnecting ClickUp from Highlight will prevent you from
				creating tasks from future comments
			</p>
			<footer>
				<Button
					trackingId="IntegrationDisconnectCancel-ClickUp"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(true)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationDisconnectSave-ClickUp"
					className={styles.modalBtn}
					type="primary"
					danger
					onClick={() => {
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
					<PlugIcon className={styles.modalBtnIcon} />
					Disconnect ClickUp
				</Button>
			</footer>
		</>
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
			title: 'ClickUp',
			dataIndex: 'clickUpSpaces',
			key: 'clickUpSpaces',
			width: '55%',
			render: (_: string, row: any) => {
				const clickUpSpaceId = projectMap.get(row.id)
				const opts = allSpaces.find((s) => s.id === clickUpSpaceId)
				return (
					<div className={styles.select}>
						<Select
							className="w-full"
							value={opts}
							onChange={row.onUpdateProjectLink}
							options={selectOptions}
							placeholder="ClickUp space"
							allowClear
						/>
					</div>
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
		<div>
			<p className={clsx(styles.modalSubTitle)}>
				Select ClickUp spaces to use for each of your Highlight
				projects.
			</p>
			<div className="my-6">
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
			</div>
			<footer className="flex justify-end gap-2 pt-0">
				<Button
					trackingId="IntegrationConfigurationCancel-ClickUp"
					className={styles.modalBtn}
					onClick={() => {
						onCancel && onCancel()
						setModalOpen(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-ClickUp"
					className={styles.modalBtn}
					type="primary"
					target="_blank"
					onClick={onSave}
				>
					<span className={styles.modalBtnText}>
						<Sparkles2Icon className={styles.modalBtnIcon} />
						<span>Update Settings</span>
					</span>
				</Button>
			</footer>
		</div>
	)
}

export default ClickUpIntegrationConfig
