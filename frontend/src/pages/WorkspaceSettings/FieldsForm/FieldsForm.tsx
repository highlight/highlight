import { toast } from '@components/Toaster'
import { useEditProjectMutation, useEditWorkspaceMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Form, Stack, Tooltip } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import React, { useState } from 'react'

import commonStyles from '../../../Common.module.css'
import { Button } from '../../../components/Button'

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
	const loading = editProjectLoading || editWorkspaceLoading

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
			<Stack gap="16">
				<Form.Input
					name="name"
					label="Name"
					value={name}
					onChange={(e) => {
						setName(e.target.value)
					}}
					disabled={formDisabled}
				/>
				{isWorkspace ? null : (
					<Form.Input
						name="email"
						label="Billing Email"
						placeholder="Billing Email"
						type="email"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value)
						}}
						disabled={formDisabled}
					/>
				)}
				<Tooltip
					disabled={!formDisabled}
					trigger={
						<Button
							trackingId={`${
								isWorkspace ? 'Workspace' : 'Project'
							}Update`}
							type="submit"
							kind="primary"
							className={commonStyles.submitButton}
							disabled={formDisabled}
							loading={loading}
						>
							Save changes
						</Button>
					}
				>
					You do not have permission to edit these settings. Please
					contact your workspace admin.
				</Tooltip>
			</Stack>
		</form>
	)
}
