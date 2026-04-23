import { toast } from '@components/Toaster'
import { useEditProjectMutation, useEditWorkspaceMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	Box,
	Form,
	Stack,
	Tooltip,
} from '@highlight-run/ui/components'
import { Button } from '@components/Button'
import { useParams } from '@util/react-router/useParams'
import React, { useState } from 'react'

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
			<Stack gap="12">
				<Box display="flex" alignItems="center" gap="12">
					<Box style={{ width: 120 }}>
						<label className={styles.fieldKey}>Name</label>
					</Box>
					<Form.Input
						name="name"
						value={name}
						onChange={(e) => {
							setName(e.target.value)
						}}
						disabled={formDisabled}
						style={{ flexGrow: 1 }}
					/>
				</Box>
				{isWorkspace ? null : (
					<Box display="flex" alignItems="center" gap="12">
						<Box style={{ width: 120 }}>
							<label className={styles.fieldKey}>
								Billing Email
							</label>
						</Box>
						<Form.Input
							placeholder="Billing Email"
							type="email"
							name="email"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value)
							}}
							disabled={formDisabled}
							style={{ flexGrow: 1 }}
						/>
					</Box>
				)}
				<Box display="flex" justifyContent="flex-end">
					<Tooltip
						disabled={!formDisabled}
						trigger={
							<Button
								disabled={formDisabled}
								loading={
									editProjectLoading || editWorkspaceLoading
								}
								type="submit"
								trackingId="FieldsFormSubmit"
							>
								Save changes
							</Button>
						}
					>
						You do not have permission to edit these settings.
						Please contact your workspace admin.
					</Tooltip>
				</Box>
			</Stack>
		</form>
	)
}
