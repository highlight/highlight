import {
	Box,
	Form,
	Stack,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { toast } from '@components/Toaster'
import { useEditProjectMutation, useEditWorkspaceMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { useParams } from '@util/react-router/useParams'
import React, { useState } from 'react'

import { Button } from '@/components/Button'

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

	const onDiscard = () => {
		setName(defaultName || '')
		setEmail(defaultEmail || '')
	}

	const isDirty = name !== (defaultName || '') || email !== (defaultEmail || '')

	return (
		<Form onSubmit={onSubmit}>
			<Stack gap="16">
				<Box display="flex" alignItems="center" gap="16">
					<Box flexShrink={0} style={{ width: 100 }}>
						<Text weight="bold" size="small">
							Name
						</Text>
					</Box>
					<Form.Input
						id="name"
						name="name"
						value={name}
						onChange={(e) => {
							setName(e.target.value)
						}}
						style={{ flexGrow: 1 }}
						disabled={formDisabled}
					/>
				</Box>
				{isWorkspace ? null : (
					<Box display="flex" alignItems="center" gap="16">
						<Box flexShrink={0} style={{ width: 100 }}>
							<Text weight="bold" size="small">
								Billing Email
							</Text>
						</Box>
						<Form.Input
							id="email"
							placeholder="Billing Email"
							type="email"
							name="email"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value)
							}}
							style={{ flexGrow: 1 }}
							disabled={formDisabled}
						/>
					</Box>
				)}
				<Box display="flex" justifyContent="flex-end" gap="8" pt="8">
					{isDirty && (
						<Button
							kind="secondary"
							emphasis="medium"
							trackingId="WorkspaceSettingsDiscard"
							onClick={onDiscard}
							disabled={formDisabled}
						>
							Discard changes
						</Button>
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
								disabled={formDisabled}
								loading={
									editProjectLoading || editWorkspaceLoading
								}
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
		</Form>

	)
}
