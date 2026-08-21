import {
	Box,
	Button,
	ButtonIcon,
	Stack,
	Text,
} from '@highlight-run/ui/components'
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
import analytics from '@util/analytics'
import useMap from '@util/useMap'
import React, { useEffect, useState } from 'react'

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
		<Stack gap="12">
			<Box py="8">
				<Text color="moderate">
					Connect Highlight with Vercel to configure environment
					variables for source map uploads.
				</Text>
			</Box>
			<Box
				display="flex"
				justifyContent="flex-end"
				gap="8"
				paddingTop="16"
				borderTop="secondary"
			>
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track('IntegrationConfigurationCancel-Vercel')
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
						analytics.track('IntegrationConfigurationSave-Vercel')
						window.open('https://vercel.com/integrations/highlight/new', '_blank')
					}}
				>
					Connect Highlight with Vercel
				</Button>
			</Box>
		</Stack>
	)
}

const VercelIntegrationDisconnect: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
}) => {
	const { removeVercelIntegrationFromProject } = useVercelIntegration()

	return (
		<Stack gap="12">
			<Box py="8">
				<Text color="moderate">
					Disconnecting Vercel from Highlight will remove the
					environment variables for source map uploads.
				</Text>
			</Box>
			<Box
				display="flex"
				justifyContent="flex-end"
				gap="8"
				paddingTop="16"
				borderTop="secondary"
			>
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track('IntegrationDisconnectCancel-Vercel')
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
						analytics.track('IntegrationDisconnectSave-Vercel')
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
					Disconnect Vercel
				</Button>
			</Box>
		</Stack>
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
					<Box display="flex" alignItems="center">
						<Select
							className="w-full"
							value={opts}
							onChange={row.onUpdateProjectLink}
							options={selectOptions}
							placeholder="Vercel project(s)"
							mode="multiple"
						/>
					</Box>
				)
			},
		},
		{
			title: 'Arrow',
			render: () => (
				<Box display="flex" justifyContent="center">
					<Text color="moderate">→</Text>
				</Box>
			),
		},
		{
			title: 'Highlight',
			dataIndex: 'name',
			key: 'name',
			width: '45%',
			render: (value: string, row: any) => {
				return (
					<Box display="flex" gap="8" alignItems="center">
						<Box display="flex" style={{ height: 20, width: 20 }}>
							<SvgHighlightLogoOnLight width={20} height={20} />
						</Box>
						{row.editable ? (
							<>
								<Input
									style={{ fontSize: 14 }}
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
								<Box display="flex" style={{ height: 32, width: 32 }}>
									<ButtonIcon
										kind="secondary"
										emphasis="low"
										icon={<SvgTrashIconSolid />}
										onClick={() => {
											analytics.track(
												'IntegrationConfiguration-Vercel-DeleteNewProject',
											)
											onProjectDelete(row.id)
										}}
									/>
								</Box>
							</>
						) : (
							<Box
								title={value}
								style={{
									maxWidth: 150,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}
							>
								<Text color="moderate">{value}</Text>
							</Box>
						)}
					</Box>
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
		<Stack gap="12">
			<Box py="8">
				<Text color="moderate">
					Select Vercel projects to link to your Highlight projects.
				</Text>
			</Box>
			<Box my="24">
				<Card noPadding>
					<Table
						dataSource={highlightProjects}
						columns={tableColumns}
						pagination={false}
						showHeader={false}
						rowHasPadding
						smallPadding
					></Table>
					<Box
						display="flex"
						justifyContent="flex-end"
						padding="16"
						borderTop="secondary"
					>
						<Button
							kind="secondary"
							emphasis="medium"
							onClick={() => {
								analytics.track(
									'IntegrationConfiguration-Vercel-NewHighlightProject',
								)
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
					</Box>
				</Card>
			</Box>
			<Box
				display="flex"
				justifyContent="flex-end"
				gap="8"
				paddingTop="16"
				borderTop="secondary"
			>
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track('IntegrationConfigurationCancel-Vercel')
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
						analytics.track('IntegrationConfigurationSave-Vercel')
						onSave()
					}}
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
					Link Projects
				</Button>
			</Box>
		</Stack>
	)
}

export default VercelIntegrationConfig

