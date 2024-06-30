import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import Input from '@components/Input/Input'
import Select from '@components/Select/Select'
import Table from '@components/Table/Table'
import { toast } from '@components/Toaster'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { namedOperations } from '@graph/operations'
import { VercelProjectMappingInput } from '@graph/schemas'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import SvgTrashIconSolid from '@icons/TrashIconSolid'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useVercelIntegration } from '@pages/IntegrationsPage/components/VercelIntegration/utils'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import useMap from '@util/useMap'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'

import styles from './VercelIntegrationConfig.module.css'

const VercelIntegrationConfig: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
	action,
}) => {
	switch (action) {
		case IntegrationAction.Setup:
			return (
				<VercelIntegrationSetup
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		case IntegrationAction.Settings:
			return (
				<VercelIntegrationSettings
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		case IntegrationAction.Disconnect:
			return (
				<VercelIntegrationDisconnect
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		default:
			throw new Error('Unknown integration action')
	}
}

const VercelIntegrationSetup: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
}) => {
	return (
		<>
			<p className={styles.modalSubTitle}>
				Connect Highlight with Vercel to configure environment variables
				for source map uploads.
			</p>
			<footer>
				<Button
					trackingId="IntegrationConfigurationCancel-Vercel"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-Vercel"
					className={styles.modalBtn}
					type="primary"
					target="_blank"
					href="https://vercel.com/integrations/highlight/new"
					rel="noreferrer"
				>
					<span className={styles.modalBtnText}>
						<Sparkles2Icon className={styles.modalBtnIcon} />
						<span style={{ marginTop: 4 }}>
							Connect Highlight with Vercel
						</span>
					</span>
				</Button>
			</footer>
		</>
	)
}

const VercelIntegrationDisconnect: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
}) => {
	const { removeVercelIntegrationFromProject } = useVercelIntegration()

	return (
		<>
			<p className={styles.modalSubTitle}>
				Disconnecting Vercel from Highlight will remove the environment
				variables for source map uploads.
			</p>
			<footer>
				<Button
					trackingId="IntegrationDisconnectCancel-Slack"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(true)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationDisconnectSave-Slack"
					className={styles.modalBtn}
					type="primary"
					danger
					onClick={() => {
						removeVercelIntegrationFromProject()
							.then(() => {
								toast.success(
									'Disconnected the Vercel integration!',
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
					Disconnect Vercel
				</Button>
			</footer>
		</>
	)
}

export const VercelIntegrationSettings: React.FC<
	IntegrationConfigProps & { onCancel?: () => void; onSuccess?: () => void }
> = ({ setModalOpen, setIntegrationEnabled, onCancel, onSuccess }) => {
	const { allProjects: allHighlightProjects } = useApplicationContext()
	const projectId =
		(allHighlightProjects && allHighlightProjects[0]?.id) ?? '0'

	const [projectMap, projectMapSet, projectMapSetMulti] = useMap<
		string,
		string[]
	>()

	const [tempId, setTempId] = useState(1)
	const [tempHighlightProjects, setTempHighlightProjects] = useState<any[]>(
		[],
	)

	const onProjectNameChange = (id: string, name: string) => {
		const matchingIndex = tempHighlightProjects.findIndex(
			(p) => p.id === id,
		)
		if (matchingIndex === -1) {
			return
		}
		const cloned = [...tempHighlightProjects]
		cloned[matchingIndex] = { ...cloned[matchingIndex], name }
		setTempHighlightProjects(cloned)
	}

	const onProjectDelete = (id: string) => {
		const matchingIndex = tempHighlightProjects.findIndex(
			(p) => p.id === id,
		)
		if (matchingIndex === -1) {
			return
		}
		const cloned = [...tempHighlightProjects]
		cloned.splice(matchingIndex, 1)
		projectMapSet(id, [])
		setTempHighlightProjects(cloned)
	}

	const {
		allVercelProjects,
		vercelProjectMappings,
		isVercelIntegratedWithProject,
		updateVercelSettings,
		loading,
	} = useVercelIntegration(projectId)

	useEffect(() => {
		if (!vercelProjectMappings) {
			return
		}

		const t = new Map<string, string[]>()
		for (const m of vercelProjectMappings) {
			if (!t.has(m.project_id)) {
				t.set(m.project_id, [])
			}
			t.get(m.project_id)?.push(m.vercel_project_id)
		}

		projectMapSetMulti([...t.entries()])
	}, [projectMapSetMulti, vercelProjectMappings])

	const { setLoadingState, loadingState } = useAppLoadingContext()

	useEffect(() => {
		if (!loading && allVercelProjects && allVercelProjects.length > 0) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [setLoadingState, loadingState, loading, allVercelProjects])

	const highlightProjects: any[] = []
	if (!!allHighlightProjects) {
		for (const p of allHighlightProjects.concat(tempHighlightProjects)) {
			if (!!p) {
				if (!projectMap.has(p.id)) {
					projectMapSet(p.id, [])
				}

				highlightProjects.push({
					...p,
					vercelProjects: [],
					onUpdateProjectLink: (vercelProjectNames: string[]) => {
						projectMapSet(
							p.id,
							vercelProjectNames.map(
								(n) =>
									allVercelProjects?.find((p) => p.name === n)
										?.id ?? '',
							),
						)
					},
				})
			}
		}
	}

	useEffect(() => {
		if (isVercelIntegratedWithProject) {
			setIntegrationEnabled(true)
		}
	}, [isVercelIntegratedWithProject, setIntegrationEnabled, setModalOpen])

	const selectedOptions: string[] = []
	for (const v of projectMap.values()) {
		selectedOptions.push(...v)
	}

	const selectOptions = (
		allVercelProjects?.map((p) => ({
			id: p.id,
			value: p.name,
			displayValue: p.name,
		})) || []
	).filter((o) => !selectedOptions.includes(o.id))

	// If there's only one option available, default to that.
	useEffect(() => {
		if (highlightProjects.length === 1 && selectOptions.length === 1) {
			projectMapSet(highlightProjects[0].id, [selectOptions[0].id])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [highlightProjects.length, selectOptions.length])

	const tableColumns = [
		{
			title: 'Vercel',
			dataIndex: 'vercelProjects',
			key: 'vercelProjects',
			width: '45%',
			render: (_: string, row: any) => {
				const vercelProjectIds = projectMap.get(row.id)
				const opts = vercelProjectIds
					?.map(
						(i) => allVercelProjects?.find((j) => j.id === i)?.name,
					)
					.filter((i) => !!i)
				return (
					<div className={styles.select}>
						<Select
							className="w-full"
							value={opts}
							onChange={row.onUpdateProjectLink}
							options={selectOptions}
							placeholder="Vercel project(s)"
							mode="multiple"
						/>
					</div>
				)
			},
		},
		{
			title: 'Arrow',
			render: () => <div className="justify-center">→</div>,
		},
		{
			title: 'Highlight',
			dataIndex: 'name',
			key: 'name',
			width: '45%',
			render: (value: string, row: any) => {
				return (
					<div className="flex gap-2">
						<div className="h-[20px] w-[20px]">
							<SvgHighlightLogoOnLight width={20} height={20} />
						</div>
						{row.editable ? (
							<>
								<Input
									className={styles.projectInput}
									title={value}
									value={value}
									onChange={(e) => {
										onProjectNameChange(
											row.id,
											e.target.value,
										)
									}}
									placeholder="e.g. Frontend"
								></Input>
								<div className="h-8 w-8">
									<Button
										className="rounded-lg"
										iconButton
										trackingId="IntegrationConfiguration-Vercel-DeleteNewProject"
										onClick={() => {
											onProjectDelete(row.id)
										}}
									>
										<SvgTrashIconSolid />
									</Button>
								</div>
							</>
						) : (
							<div
								title={value}
								className="max-w-[150px] overflow-hidden text-ellipsis break-normal"
							>
								{value}
							</div>
						)}
					</div>
				)
			},
		},
	]

	const projectMappings: VercelProjectMappingInput[] = []
	for (const [projectId, vercelIds] of projectMap.entries()) {
		for (const vercelId of vercelIds) {
			// Skip for vercelIds the user no longer has access to
			// (could be deleted or have had their permissions revoked)
			if (!allVercelProjects?.map((p) => p.id).includes(vercelId)) {
				continue
			}
			// If this project hasn't been created yet, get its name
			const tempProject = tempHighlightProjects.find(
				(p) => p.id === projectId,
			)

			// If this project hasn't been created yet, pass undefined as the project id
			projectMappings.push({
				project_id: tempProject !== undefined ? undefined : projectId,
				vercel_project_id: vercelId,
				new_project_name: tempProject?.name,
			})
		}
	}

	const onSave = () => {
		updateVercelSettings({
			variables: {
				project_id: projectId,
				project_mappings: projectMappings,
			},
			refetchQueries: [
				namedOperations.Query.GetProjects,
				namedOperations.Query.GetDropdownOptions,
				namedOperations.Query.GetProjectsAndWorkspaces,
				namedOperations.Query.GetWorkspaceIsIntegratedWithVercel,
			],
		})
			.then(() => {
				onSuccess && onSuccess()
				toast.success('Vercel projects linked!')
				setModalOpen(false)
			})
			.catch((reason: any) => {
				toast.error(String(reason))
			})
	}

	return (
		<div>
			<p className={clsx(styles.modalSubTitle)}>
				Select Vercel projects to link to your Highlight projects.
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
					<div className="border-0 border-t border-solid border-[#eaeaea]">
						<Button
							trackingId="IntegrationConfiguration-Vercel-NewHighlightProject"
							className={clsx('m-4 ml-auto', styles.modalBtn)}
							onClick={() => {
								const tId = 'new_' + tempId
								setTempHighlightProjects((cur) =>
									cur.concat([
										{
											name: '',
											editable: true,
											id: tId,
											vercelProjects: [],
											onUpdateProjectLink: (
												vercelProjectNames: string[],
											) => {
												projectMapSet(
													tId,
													vercelProjectNames.map(
														(n) =>
															allVercelProjects?.find(
																(p) =>
																	p.name ===
																	n,
															)?.id ?? '',
													),
												)
											},
										},
									]),
								)
								setTempId((cur) => cur + 1)
							}}
						>
							Create New Highlight Project +
						</Button>
					</div>
				</Card>
			</div>
			<footer className="flex justify-end gap-2 pt-0">
				<Button
					trackingId="IntegrationConfigurationCancel-Vercel"
					className={styles.modalBtn}
					onClick={() => {
						onCancel && onCancel()
						setModalOpen(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-Vercel"
					className={styles.modalBtn}
					type="primary"
					target="_blank"
					onClick={onSave}
					disabled={
						projectMappings.length === 0 || // If no project mappings
						tempHighlightProjects.find((p) => !p.name) || // If a new project is missing a name
						tempHighlightProjects.find((p) => {
							const vercelProjects = projectMap.get(p.id)
							// If a new project has no Vercel projects
							return (
								vercelProjects === undefined ||
								vercelProjects.length === 0
							)
						})
					}
				>
					<span className={styles.modalBtnText}>
						<Sparkles2Icon className={styles.modalBtnIcon} />
						<span>Link Projects</span>
					</span>
				</Button>
			</footer>
		</div>
	)
}

export default VercelIntegrationConfig
