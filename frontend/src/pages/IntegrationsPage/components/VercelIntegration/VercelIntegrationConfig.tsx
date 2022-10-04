import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import Select from '@components/Select/Select'
import Table from '@components/Table/Table'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { VercelProjectMappingInput } from '@graph/schemas'
import HighlightLogoSmall from '@icons/HighlightLogoSmall'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useVercelIntegration } from '@pages/IntegrationsPage/components/VercelIntegration/utils'
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext'
import useMap from '@util/useMap'
import { message } from 'antd'
import classNames from 'classnames'
import React, { useEffect } from 'react'

import styles from './VercelIntegrationConfig.module.scss'

const VercelIntegrationConfig: React.FC<IntegrationConfigProps> = ({
	setModelOpen,
	setIntegrationEnabled,
	action,
}) => {
	switch (action) {
		case IntegrationAction.Setup:
			return (
				<VercelIntegrationSetup
					setModelOpen={setModelOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		case IntegrationAction.Settings:
			return (
				<VercelIntegrationSettings
					setModelOpen={setModelOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		case IntegrationAction.Disconnect:
			return (
				<VercelIntegrationDisconnect
					setModelOpen={setModelOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		default:
			throw new Error('Unknown integration action')
	}
}

const VercelIntegrationSetup: React.FC<IntegrationConfigProps> = ({
	setModelOpen,
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
						setModelOpen(false)
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
					href={`https://vercel.com/integrations/highlight/new`}
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
	setModelOpen,
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
					trackingId={`IntegrationDisconnectCancel-Slack`}
					className={styles.modalBtn}
					onClick={() => {
						setModelOpen(false)
						setIntegrationEnabled(true)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId={`IntegrationDisconnectSave-Slack`}
					className={styles.modalBtn}
					type="primary"
					danger
					onClick={() => {
						removeVercelIntegrationFromProject()
							.then(() => {
								message.success(
									'Disconnected the Vercel integration!',
								)
								setModelOpen(false)
								setIntegrationEnabled(false)
							})
							.catch((reason: any) => {
								message.error(String(reason))
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
> = ({ setModelOpen, setIntegrationEnabled, onCancel, onSuccess }) => {
	const { allProjects: allHighlightProjects } = useApplicationContext()
	const projectId =
		(allHighlightProjects && allHighlightProjects[0]?.id) ?? '0'

	const [projectMap, projectMapSet, projectMapSetMulti] = useMap<
		string,
		string[]
	>()

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
		for (const p of allHighlightProjects) {
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
	}, [isVercelIntegratedWithProject, setIntegrationEnabled, setModelOpen])

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
			width: '55%',
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
							className={'w-full'}
							value={opts}
							onChange={row.onUpdateProjectLink}
							options={selectOptions}
							placeholder={'Vercel project(s)'}
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
			width: '35%',
			render: (value: string) => {
				return (
					<div className="flex gap-2">
						<HighlightLogoSmall width={20} height={20} />
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
	]

	const projectMappings: VercelProjectMappingInput[] = []
	for (const [projectId, vercelIds] of projectMap.entries()) {
		for (const vercelId of vercelIds) {
			projectMappings.push({
				project_id: projectId,
				vercel_project_id: vercelId,
			})
		}
	}

	const onSave = () => {
		updateVercelSettings({
			variables: {
				project_id: projectId,
				project_mappings: projectMappings,
			},
		})
			.then(() => {
				onSuccess && onSuccess()
				message.success('Vercel projects linked!')
				setModelOpen(false)
			})
			.catch((reason: any) => {
				message.error(String(reason))
			})
	}

	return (
		<div>
			<p className={classNames(styles.modalSubTitle)}>
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
				</Card>
			</div>
			<footer className="flex justify-end gap-2">
				<Button
					trackingId={`IntegrationConfigurationCancel-Vercel`}
					className={styles.modalBtn}
					onClick={() => {
						onCancel && onCancel()
						setModelOpen(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId={`IntegrationConfigurationSave-Vercel`}
					className={styles.modalBtn}
					type="primary"
					target="_blank"
					onClick={onSave}
					disabled={projectMappings.length === 0}
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
