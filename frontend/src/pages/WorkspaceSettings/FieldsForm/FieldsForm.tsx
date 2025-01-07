import Input from '@components/Input/Input'
import { Tooltip } from '@highlight-run/ui/components'
import { toast } from '@components/Toaster'
import { useEditProjectMutation, useEditWorkspaceMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { useParams } from '@util/react-router/useParams'
import React, { useState } from 'react'

import commonStyles from '../../../Common.module.css'
import Button from '../../../components/Button/Button/Button'
import { CircularSpinner } from '../../../components/Loading/Loading'
import styles from './FieldsForm.module.css'

type Props = {
	defaultName?: string | null
	defaultEmail?: string | null
	disabled?: boolean
}

export const FieldsForm: React.FC<Props> = ({
	defaultName,
	defaultEmail,
	disabled: formDisabled,
}) => {
	const { project_id, workspace_id } = useParams<{
		project_id: string
		workspace_id: string
	}>()
	const isWorkspace = !!workspace_id
	const [name, setName] = useState(defaultName || '')
	const [email, setEmail] = useState(defaultEmail || '')

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
				toast.success('Updated workspace fields!', { duration: 5000 })
			})
		} else {
			editProject({
				variables: {
					id: project_id!,
					name,
					billing_email: email,
				},
			}).then(() => {
				toast.success('Updated project fields!', { duration: 5000 })
			})
		}
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
					disabled={formDisabled}
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
							disabled={formDisabled}
						/>
					</div>
				</>
			)}
			<div className={styles.fieldRow}>
				<Tooltip
					disabled={!formDisabled}
					trigger={
						<Button
							trackingId={`${
								isWorkspace ? 'Workspace' : 'Project'
							}Update`}
							htmlType="submit"
							type="primary"
							className={commonStyles.submitButton}
							disabled={formDisabled}
						>
							{editProjectLoading || editWorkspaceLoading ? (
								<CircularSpinner
									style={{
										fontSize: 18,
										color: 'var(--text-primary-inverted)',
									}}
								/>
							) : (
								'Save changes'
							)}
						</Button>
					}
				>
					You do not have permission to edit these settings. Please
					contact your workspace admin.
				</Tooltip>
			</div>
		</form>
	)
}
