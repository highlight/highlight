import Button from '@components/Button/Button/Button'
import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import Select from '@components/Select/Select'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetWorkspaceQuery } from '@graph/hooks'
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
						trackingId="SubmitProjectSwitchForm"
						type="primary"
						className={styles.button}
						block
						htmlType="submit"
						loading={loading}
						disabled={selectedProject.length === 0}
					>
						Enter Project
					</Button>
					<ButtonLink
						trackingId="SwitchProject-CreateProject"
						className={styles.button}
						to={`/w/${workspace_id}/new`}
						fullWidth
						type="default"
					>
						Create a New Project
					</ButtonLink>
				</form>
			</div>
		</>
	)
}

export default SwitchProject
