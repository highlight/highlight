import clsx from 'clsx'
import React, { useEffect } from 'react'

import { toast } from '@components/Toaster'
import { Button, Card, Select, Table } from '@highlight-run/ui/components'
import { IntegrationProjectMappingInput, IntegrationType } from '@graph/schemas'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import { useHeightIntegration } from '@pages/IntegrationsPage/components/HeightIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useParams } from '@util/react-router/useParams'
import useMap from '@util/useMap'
import { GetBaseURL } from '@util/window'
import { btoaSafe } from '@/util/string'
import analytics from '@util/analytics'

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

	return (
		<>
			<p className={styles.modalSubTitle}>
				Connect Highlight with Height.
			</p>
			<footer>
				<Button
					kind="secondary"
					className={styles.modalBtn}
					onClick={() => {
						analytics.track('Button-IntegrationConfigurationCancel-Height')
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="primary"
					className={styles.modalBtn}
					iconLeft={<Sparkles2Icon className={styles.modalBtnIcon} />}
					onClick={() => {
						analytics.track('Button-IntegrationConfigurationSave-Height')
						window.open(`https://height.app/oauth/authorization?client_id=${HEIGHT_CLIENT_ID}&redirect_uri=${redirectUri}&access_types=appWorkspace&scope=api&state=${btoaSafe(
							JSON.stringify({
								project_id: project_id,
								workspace_id: currentWorkspace?.id,
							}),
						)}`, '_blank', 'noreferrer')
					}}
				>
					<span style={{ marginTop: 4 }}>
						Connect Highlight with Height
					</span>
				</Button>
			</footer>
		</>
	)
}

const HeightIntegrationDisconnect: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
}) => {
	const { removeIntegration } = useHeightIntegration()

	return (
		<>
			<p className={styles.modalSubTitle}>
				Disconnecting Height from Highlight will prevent you from
				creating tasks from future comments
			</p>
			<footer>
				<Button
					kind="secondary"
					className={styles.modalBtn}
					onClick={() => {
						analytics.track('Button-IntegrationDisconnectCancel-Height')
						setModalOpen(false)
						setIntegrationEnabled(true)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="danger"
					className={styles.modalBtn}
					iconLeft={<PlugIcon className={styles.modalBtnIcon} />}
					onClick={() => {
						analytics.track('Button-IntegrationDisconnectSave-Height')
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
			</footer>
		</>
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
			name: w.name,
		})) || []

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
		<div>
			<p className={clsx(styles.modalSubTitle)}>
				Select Height workspaces to use for each of your Highlight
				projects.
			</p>
			<div className="my-6">
				<Card>
					<Table noBorder>
						<Table.Body>
							{highlightProjects.map((project: any) => (
								<Table.Row key={project.id}>
									<Table.Cell style={{ width: '35%' }}>
										<div className="flex gap-2">
											<div className="h-[20px] w-[20px]">
												<SvgHighlightLogoOnLight width={20} height={20} />
											</div>
											<div
												title={project.name}
												className="max-w-[150px] overflow-hidden text-ellipsis break-normal"
											>
												{project.name}
											</div>
										</div>
									</Table.Cell>
									<Table.Cell>
										<div className="justify-center">→</div>
									</Table.Cell>
									<Table.Cell style={{ width: '55%' }}>
										{(() => {
											const heightWorkspaceId = projectMap.get(project.id)
											const selectedWorkspace = settings.height_workspaces.find(
												(w) => w.id === heightWorkspaceId,
											)
											const value = selectedWorkspace?.name
											return (
												<div className={styles.select}>
													<Select
														value={value}
														onValueChange={(val: any) => project.onUpdateProjectLink(val?.name || val)}
														options={selectOptions}
														placeholder="Height workspace"
														clearable
													/>
												</div>
											)
										})()}
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				</Card>
			</div>
			<footer className="flex justify-end gap-2 pt-0">
				<Button
					kind="secondary"
					className={styles.modalBtn}
					onClick={() => {
						analytics.track('Button-IntegrationConfigurationCancel-Height')
						onCancel && onCancel()
						setModalOpen(false)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="primary"
					className={styles.modalBtn}
					iconLeft={<Sparkles2Icon className={styles.modalBtnIcon} />}
					onClick={() => {
						analytics.track('Button-IntegrationConfigurationSave-Height')
						onSave()
					}}
				>
					<span>Update Settings</span>
				</Button>
			</footer>
		</div>
	)
}

export default HeightIntegrationConfig
