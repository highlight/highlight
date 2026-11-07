import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import LoadingBox from '@components/LoadingBox'
import { useDeleteProjectMutation, useGetProjectQuery } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Form } from '@highlight-run/ui/components'
import { FieldsForm } from '@pages/WorkspaceSettings/FieldsForm/FieldsForm'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/authentication/AuthContext'
import { AdminRole } from '@/graph/generated/schemas'

import commonStyles from '../../../Common.module.css'
import Button from '../../../components/Button/Button/Button'
import styles from './DangerForm.module.css'

type DangerDeleteSectionProps = {
	projectName?: string | null
	loading: boolean
	deleteLoading: boolean
	onSubmit: (e: { preventDefault: () => void }) => void
}

const DangerDeleteSection: React.FC<DangerDeleteSectionProps> = ({
	projectName,
	loading,
	deleteLoading,
	onSubmit,
}) => {
	const [confirmationText, setConfirmationText] = useState('')

	if (loading) {
		return <LoadingBox />
	}

	return (
		<Form onSubmit={onSubmit}>
			<p className={styles.dangerSubTitle}>
				This will immediately delete all session and errors in this
				project. Please type &apos;{`${projectName}`}&apos; to confirm.
			</p>
			<div className={styles.dangerRow}>
				<Form.Input
					placeholder={`${projectName}`}
					name="text"
					value={confirmationText}
					onChange={(e) => {
						setConfirmationText(e.target.value)
					}}
				/>
				<Button
					trackingId="DeleteProject"
					danger
					type="primary"
					className={clsx(
						commonStyles.submitButton,
						styles.deleteButton,
					)}
					disabled={confirmationText !== projectName}
					htmlType="submit"
					loading={deleteLoading}
				>
					Delete
				</Button>
			</div>
		</Form>
	)
}

const extractProjectProps = (
	data: ReturnType<typeof useGetProjectQuery>['data'],
) => ({
	name: data?.project?.name,
	billingEmail: data?.project?.billing_email,
})

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

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		deleteProject({ variables: { id: project_id! } })
	}

	if (deleteData?.deleteProject) {
		return <Navigate replace to="/" />
	}

	const projectProps = extractProjectProps(data)

	return (
		<>
			<FieldsBox id="project">
				<h3>Project Properties</h3>
				<FieldsForm
					defaultName={projectProps.name}
					defaultEmail={projectProps.billingEmail}
					disabled={!isAdminRole}
				/>
			</FieldsBox>
			{isAdminRole && (
				<FieldsBox id="danger">
					<h3>Danger Zone</h3>
					<DangerDeleteSection
						projectName={projectProps.name}
						loading={loading}
						deleteLoading={deleteLoading}
						onSubmit={onSubmit}
					/>
				</FieldsBox>
			)}
		</>
	)
}
