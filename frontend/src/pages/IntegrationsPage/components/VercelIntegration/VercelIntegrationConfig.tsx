import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import Select from '@components/Select/Select'
import Table from '@components/Table/Table'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useVercelIntegration } from '@pages/IntegrationsPage/components/VercelIntegration/utils'
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext'
import { useParams } from '@util/react-router/useParams'
import useMap from '@util/useMap'
import React, { useEffect } from 'react'
import { StringParam, useQueryParams } from 'use-query-params'

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
				Connect Highlight with Vercel.
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
					href="https://vercel.com/integrations/zane-test/new"
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
				Disconnecting Front from Highlight will stop enhancing your
				customer interactions.
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
						setModelOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					<PlugIcon className={styles.modalBtnIcon} />
					Disconnect Front
				</Button>
			</footer>
		</>
	)
}

const VercelIntegrationSettings: React.FC<IntegrationConfigProps> = ({
	setModelOpen,
	setIntegrationEnabled,
}) => {
	const { allProjects } = useApplicationContext()

	const [projectMap, projectMapSet] = useMap<string, string | undefined>()

	const highlightProjects = []
	if (!!allProjects) {
		for (const p of allProjects) {
			if (!!p) {
				if (!projectMap.has(p.id)) {
					projectMapSet(p.id, undefined)
				}

				highlightProjects.push({
					...p,
					vercelProject: undefined,
					onUpdateProjectLink: (vercelProjectId: string) => {
						projectMapSet(p.id, vercelProjectId)
						console.log('projectMap', projectMap)
					},
				})
			}
		}
	}

	const { project_id } = useParams<{
		project_id: string
	}>()

	const [{ code, configurationId, next }] = useQueryParams({
		code: StringParam,
		configurationId: StringParam,
		next: StringParam,
	})

	const {
		addVercelIntegrationToProject,
		vercelProjects,
		isVercelIntegratedWithProject,
	} = useVercelIntegration()

	console.log('isVercelIntegratedWithProject', isVercelIntegratedWithProject)

	useEffect(() => {
		if (!!code) {
			addVercelIntegrationToProject(code, project_id)
		}
	}, [addVercelIntegrationToProject, code, project_id])

	useEffect(() => {
		if (isVercelIntegratedWithProject) {
			setIntegrationEnabled(true)
		}
	}, [isVercelIntegratedWithProject, setIntegrationEnabled, setModelOpen])

	// if (!isVercelIntegratedWithProject) {
	// 	return null
	// }

	const selectOptions =
		vercelProjects?.map((p) => ({
			id: p.id,
			value: p.id,
			displayValue: p.name,
		})) || []

	let defaultValue: string | undefined = undefined
	if (highlightProjects.length === 1 && selectOptions.length === 1) {
		defaultValue = selectOptions[0].displayValue
	}

	const tableColumns = [
		{
			title: 'Highlight',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Vercel',
			dataIndex: 'vercelProject',
			key: 'vercelProject',
			render: (role: string, record: any) => {
				return (
					<div>
						<Select
							className="w-full"
							onChange={record.onUpdateProjectLink}
							options={selectOptions}
							allowClear={true}
							placeholder={'Select a Vercel project'}
							defaultValue={defaultValue}
						/>
					</div>
				)
			},
		},
	]

	return (
		<>
			<p className={styles.modalSubTitle}>
				Select Vercel projects to link to your Highlight projects.
			</p>
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
			<footer>
				<Button
					trackingId={`IntegrationConfigurationCancel-Vercel`}
					className={styles.modalBtn}
					onClick={() => {
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
					href={next || ''}
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

export default VercelIntegrationConfig
