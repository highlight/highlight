import Input from '@components/Input/Input'
import {
	useEditProjectMutation,
	useEditWorkspaceMutation,
	useGetProjectOrWorkspaceQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import commonStyles from '../../../Common.module.css'
import Button from '../../../components/Button/Button/Button'
import {
	CircularSpinner,
	LoadingBar,
} from '../../../components/Loading/Loading'
import styles from './FieldsForm.module.css'

export const FieldsForm = () => {
	const { project_id, workspace_id } = useParams<{
		project_id: string
		workspace_id: string
	}>()
	const isWorkspace = !!workspace_id
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const { data, loading } = useGetProjectOrWorkspaceQuery({
		variables: {
			project_id: project_id!,
			workspace_id: workspace_id!,
			is_workspace: isWorkspace,
		},
		skip: !project_id || !workspace_id,
	})

	const [editProject, { loading: editProjectLoading }] =
		useEditProjectMutation({
			refetchQueries: [
				namedOperations.Query.GetProjects,
				namedOperations.Query.GetProject,
			],
		})

	const [editWorkspace, { loading: editWorkspaceLoading }] =
		useEditWorkspaceMutation()

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (isWorkspace) {
			editWorkspace({
				variables: {
					id: workspace_id,
					name,
				},
			}).then(() => {
				message.success('Updated workspace fields!', 5)
			})
		} else {
			editProject({
				variables: {
					id: project_id!,
					name,
					billing_email: email,
				},
			}).then(() => {
				message.success('Updated project fields!', 5)
			})
		}
	}

	const editingObj = isWorkspace ? data?.workspace : data?.project

	useEffect(() => {
		if (!loading) {
			setName(editingObj?.name || '')
			setEmail(data?.project?.billing_email || '')
		}
	}, [data?.project?.billing_email, editingObj?.name, loading])

	if (loading) {
		return <LoadingBar />
	}

	return (
		<form onSubmit={onSubmit} key={project_id}>
			<div className={styles.fieldRow}>
				<label className={styles.fieldKey}>Name</label>
				<Input
					name="name"
					value={name}
					onChange={(e) => {
						setName(e.target.value)
					}}
				/>
			</div>
			{isWorkspace ? null : (
				<>
					{' '}
					<div className={styles.fieldRow}>
						<label className={styles.fieldKey}>Billing Email</label>
						<Input
							placeholder="Billing Email"
							type="email"
							name="email"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value)
							}}
						/>
					</div>
				</>
			)}
			<div className={styles.fieldRow}>
				<div className={styles.fieldKey} />
				<Button
					trackingId={`${
						isWorkspace ? 'Workspace' : 'Project'
					}Update`}
					htmlType="submit"
					type="primary"
					className={clsx(
						commonStyles.submitButton,
						styles.saveButton,
					)}
				>
					{editProjectLoading || editWorkspaceLoading ? (
						<CircularSpinner
							style={{
								fontSize: 18,
								color: 'var(--text-primary-inverted)',
							}}
						/>
					) : (
						'Save'
					)}
				</Button>
			</div>
		</form>
	)
}
