import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import LoadingBox from '@components/LoadingBox'
import { useDeleteProjectMutation, useGetProjectQuery } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	Box,
	Form,
	Stack,
} from '@highlight-run/ui/components'
import { Button } from '@components/Button'
import { FieldsForm } from '@pages/WorkspaceSettings/FieldsForm/FieldsForm'
import { useParams } from '@util/react-router/useParams'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/authentication/AuthContext'
import { AdminRole } from '@/graph/generated/schemas'

import styles from './DangerForm.module.css'

export const DangerForm = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { loading, data } = useGetProjectQuery({
		variables: { id: project_id! },
		skip: !project_id,
	})
	const [confirmationText, setConfirmationText] = useState('')

	const { workspaceRole } = useAuthContext()
	const isAdminRole = workspaceRole === AdminRole.Admin

	const [deleteProject, { loading: deleteLoading, data: deleteData }] =
		useDeleteProjectMutation({
			refetchQueries: [namedOperations.Query.GetProjects],
		})

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		deleteProject({ variables: { id: project_id! } })
	}
	if (deleteData?.deleteProject) {
		return <Navigate replace to="/" />
	}
	return (
		<>
			<FieldsBox id="project">
				<h3>Project Properties</h3>
				<FieldsForm
					defaultName={data?.project?.name}
					defaultEmail={data?.project?.billing_email}
					disabled={!isAdminRole}
				/>
			</FieldsBox>
			{isAdminRole && (
				<FieldsBox id="danger">
					<h3>Danger Zone</h3>

					<form onSubmit={onSubmit}>
						{loading ? (
							<LoadingBox />
						) : (
							<Stack gap="12">
								<p className={styles.dangerSubTitle}>
									This will immediately delete all session and
									errors in this project. Please type '
									{`${data?.project?.name}`}' to confirm.
								</p>
								<Box
									display="flex"
									alignItems="center"
									gap="8"
									width="full"
								>
									<Form.Input
										placeholder={`${data?.project?.name}`}
										name="text"
										value={confirmationText}
										onChange={(e) => {
											setConfirmationText(e.target.value)
										}}
										style={{ flexGrow: 1 }}
									/>
									<Button
										kind="danger"
										emphasis="high"
										disabled={
											confirmationText !==
											data?.project?.name
										}
										type="submit"
										loading={deleteLoading}
										trackingId="ProjectSettingsDeleteProject"
									>
										Delete
									</Button>
								</Box>
							</Stack>
						)}
					</form>
				</FieldsBox>
			)}
		</>
	)
}
