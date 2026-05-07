import { Button, IconSolidLoading } from '@highlight-run/ui/components'
import { LinkButton } from '@components/LinkButton'
import Select from '@components/Select/Select'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetWorkspaceQuery } from '@graph/hooks'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Navigate } from 'react-router-dom'

import styles from './SwitchProject.module.css'

const SwitchProject = () => {
	const { workspace_id } = useParams<{
		workspace_id: string
	}>()
	const { data, loading } = useGetWorkspaceQuery({
		variables: { id: workspace_id! },
		skip: !workspace_id,
	})
	const { setLoadingState } = useAppLoadingContext()

	const [selectedProject, setSelectedProject] = useState('')
	const [shouldRedirect, setShouldRedirect] = useState(false)

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [data, setLoadingState])

	const projectOptions = (data?.workspace?.projects || [])?.map(
		(projects) => ({
			value: projects?.id || '',
			displayValue: projects?.name || '',
			id: projects?.id || '',
		}),
	)

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		setShouldRedirect(true)
	}

	const currentProject = projectOptions?.find(
		(project) => project.id === selectedProject,
	)

	if (shouldRedirect) {
		return <Navigate replace to={`/${selectedProject}/setup`} />
	}

	if (data?.workspace && data?.workspace?.projects.length < 1) {
		return <Navigate replace to={`/w/${workspace_id}/new`} />
	}

	return (
		<>
			<Helmet>
				<title>Enter Project</title>
			</Helmet>
			<div className={styles.box}>
				<form onSubmit={onSubmit}>
					<h2 className={styles.title}>Enter Project</h2>
					<p className={styles.subTitle}>
						Pick a project. If you’re having trouble getting into
						the correct project, please message us.
					</p>
					<Select
						className={styles.fullWidth}
						options={projectOptions}
						onChange={(projectId) => {
							setSelectedProject(projectId)
						}}
						value={currentProject?.id}
						placeholder="Enter a Project"
					/>
					<Button
						kind="primary"
						className={styles.button}
						style={{ width: '100%' }}
						type="submit"
						disabled={selectedProject.length === 0 || loading}
						onClick={() => {
							analytics.track('Button-SubmitProjectSwitchForm')
						}}
					>
						{loading ? <IconSolidLoading /> : 'Enter Project'}
					</Button>
					<LinkButton
						trackingId="SwitchProject-CreateProject"
						className={styles.button}
						to={`/w/${workspace_id}/new`}
						kind="secondary"
						emphasis="low"
						style={{ width: '100%' }}
					>
						Create a New Project
					</LinkButton>
				</form>
			</div>
		</>
	)
}

export default SwitchProject
