import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import { CardForm, CardFormActionsContainer } from '@components/Card/Card'
import Dot from '@components/Dot/Dot'
import Input from '@components/Input/Input'
import { CircularSpinner } from '@components/Loading/Loading'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	useCreateProjectMutation,
	useCreateWorkspaceMutation,
	useGetWorkspaceQuery,
	useGetWorkspacesCountQuery,
	useUpdateAllowedEmailOriginsMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import AutoJoinForm from '@pages/WorkspaceTeam/components/AutoJoinForm'
import { client } from '@util/graph'
import { useParams } from '@util/react-router/useParams'
import classNames from 'classnames'
import { H } from 'highlight.run'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Redirect } from 'react-router-dom'

import commonStyles from '../../Common.module.scss'
import Button from '../../components/Button/Button/Button'
import styles from './NewProject.module.scss'

const NewProjectPage = () => {
	const { workspace_id } = useParams<{ workspace_id: string }>()
	const [error, setError] = useState<undefined | string>(undefined)
	const [name, setName] = useState<string>('')
	const [autoJoinDomains, setAutoJoinDomains] = useState<string[]>()

	const { data: currentWorkspaceData } = useGetWorkspaceQuery({
		variables: { id: workspace_id },
	})
	const [
		createProject,
		{ loading: projectLoading, data: projectData, error: projectError },
	] = useCreateProjectMutation()
	const [
		createWorkspace,
		{
			loading: workspaceLoading,
			data: workspaceData,
			error: workspaceError,
		},
	] = useCreateWorkspaceMutation()
	const [updateAllowedEmailOrigins] = useUpdateAllowedEmailOriginsMutation()
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		if (projectError || workspaceError) {
			setError(projectError?.message ?? workspaceError?.message)
		}
	}, [setError, projectError, workspaceError])

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	const { data, loading } = useGetWorkspacesCountQuery()

	// User is creating a workspace if workspace is not specified in the URL
	const isWorkspace = !workspace_id

	const onSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (isWorkspace) {
			const result = await createWorkspace({
				variables: {
					name: name,
				},
			})
			const createdWorkspaceId = result.data?.createWorkspace?.id
			H.track('CreateWorkspace', { name })
			await client.cache.reset()
			setName('')
			if (createdWorkspaceId && autoJoinDomains?.length) {
				await updateAllowedEmailOrigins({
					variables: {
						allowed_auto_join_email_origins:
							JSON.stringify(autoJoinDomains),
						workspace_id: createdWorkspaceId,
					},
					refetchQueries: [namedOperations.Query.GetWorkspaceAdmins],
				})
			}
		} else {
			await createProject({
				variables: {
					name: name,
					workspace_id,
				},
				refetchQueries: [
					namedOperations.Query.GetProjects,
					namedOperations.Query.GetProjectDropdownOptions,
					namedOperations.Query.GetProjectsAndWorkspaces,
				],
			})
			H.track('CreateProject', { name })
			await client.cache.reset()
			setName('')
		}
	}

	// When a workspace is created, redirect to the 'create project' page
	if (isWorkspace && workspaceData?.createWorkspace?.id) {
		return <Redirect to={`/w/${workspaceData.createWorkspace.id}/new`} />
	}

	// When a project is created, redirect to the 'project setup' page
	if (projectData?.createProject?.id) {
		return <Redirect to={`/${projectData.createProject.id}/setup`} />
	}

	const pageType = isWorkspace ? 'workspace' : 'project'
	const pageTypeCaps = isWorkspace ? 'Workspace' : 'Project'

	return (
		<>
			<Helmet>
				<title>{isWorkspace ? 'New Workspace' : 'New Project'}</title>
			</Helmet>
			<div className={styles.box} key={workspace_id}>
				<h2 className={styles.title}>{`Create a ${pageTypeCaps}`}</h2>
				<p className={styles.subTitle}>
					{isWorkspace &&
						`This is usually your company name (e.g. Pied Piper, Hooli, Google, etc.) and can contain multiple projects.`}
					{!isWorkspace &&
						`Let's create a project! This is usually a single application (e.g. web front end, landing page, etc.).`}
				</p>
				{error && (
					<div className={commonStyles.errorMessage}>
						{`Error with ${pageType} name ` + error}
					</div>
				)}
				<CardForm onSubmit={onSubmit} className={styles.cardForm}>
					<Input
						placeholder={
							isWorkspace ? 'Pied Piper, Inc' : 'Web Front End'
						}
						name="name"
						value={name}
						onChange={(e) => {
							setName(e.target.value)
						}}
						autoComplete="off"
						autoFocus
					/>
					{isWorkspace && (
						<AutoJoinForm
							newWorkspace
							updateOrigins={(domains) => {
								setAutoJoinDomains(domains)
							}}
						/>
					)}
					<CardFormActionsContainer>
						<Button
							trackingId={`Create${pageTypeCaps}`}
							type="primary"
							className={classNames(styles.button)}
							block
							htmlType="submit"
							disabled={name.length === 0}
						>
							{projectLoading || workspaceLoading ? (
								<CircularSpinner
									style={{
										fontSize: 18,
										color: 'var(--text-primary-inverted)',
									}}
								/>
							) : (
								`Create ${pageTypeCaps}`
							)}
						</Button>
						{isWorkspace && (
							<ButtonLink
								trackingId={`Enter${pageTypeCaps}`}
								className={classNames(styles.button)}
								to="/switch"
								fullWidth
								type="default"
							>
								Already Have a Workspace?{' '}
								{!loading &&
									!!data &&
									data.workspaces_count !== 0 && (
										<Dot className={styles.workspaceCount}>
											{data.workspaces_count}
										</Dot>
									)}
							</ButtonLink>
						)}
						{!isWorkspace &&
							currentWorkspaceData?.workspace &&
							currentWorkspaceData.workspace.projects.length >
								0 && (
								<ButtonLink
									trackingId={`Enter${pageTypeCaps}`}
									className={classNames(styles.button)}
									to={`/w/${workspace_id}/switch`}
									fullWidth
									type="default"
								>
									Enter an Existing Project{' '}
									{!loading && (
										<Dot className={styles.workspaceCount}>
											{
												currentWorkspaceData.workspace
													.projects.length
											}
										</Dot>
									)}
								</ButtonLink>
							)}
					</CardFormActionsContainer>
				</CardForm>
			</div>
		</>
	)
}

export default NewProjectPage
