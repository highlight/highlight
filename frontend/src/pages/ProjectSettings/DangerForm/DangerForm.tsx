import { Button } from '@components/Button'
import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { IconAnimatedLoading } from '@components/Loading/Loading'
import { useDeleteProjectMutation, useGetProjectQuery } from '@graph/hooks'
import { Box, Form } from '@highlight-run/ui/components'
import { namedOperations } from '@graph/operations'
import { FieldsForm } from '@pages/WorkspaceSettings/FieldsForm/FieldsForm'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/authentication/AuthContext'
import { AdminRole } from '@/graph/generated/schemas'

import commonStyles from '../../../Common.module.css'
import styles from './DangerForm.module.css'

export const DangerForm = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { loading, data } = useGetProjectQuery({
		variables: { id: project_id! },
		skip: !project_id,
	})

	const { workspaceRole } = useAuthContext()
	const isAdminRole = workspaceRole === AdminRole.Admin

	const [deleteProject, { loading: deleteLoading, data: deleteData }] =
		useDeleteProjectMutation({
			refetchQueries: [namedOperations.Query.GetProjects],
		})

	const formStore = Form.useStore({
		defaultValues: {
			text: '',
		},
	})

	const confirmationText = formStore.useValue(formStore.names.text) ?? ''

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

					<Form store={formStore} onSubmit={onSubmit}>
						{loading ? (
							<Box
								display="flex"
								justifyContent="center"
								alignItems="center"
								py="12"
							>
								<IconAnimatedLoading />
							</Box>
						) : (
							<>
								<p className={styles.dangerSubTitle}>
									This will immediately delete all session and
									errors in this project. Please type '
									{`${data?.project?.name}`}' to confirm.
								</p>
								<div className={styles.dangerRow}>
									<Form.Input
										placeholder={`${data?.project?.name}`}
										name={formStore.names.text}
									/>
									<Button
										trackingId="DeleteProject"
										kind="danger"
										className={clsx(
											commonStyles.submitButton,
											styles.deleteButton,
										)}
										disabled={
											confirmationText !==
											data?.project?.name
										}
										type="submit"
										loading={deleteLoading}
									>
										Delete
									</Button>
								</div>
							</>
						)}
					</Form>
				</FieldsBox>
			)}
		</>
	)
}
