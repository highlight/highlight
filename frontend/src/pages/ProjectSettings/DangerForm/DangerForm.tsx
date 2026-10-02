import {
	Box,
	Form,
	Heading,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import {
	useDeleteProjectMutation,
	useEditProjectMutation,
	useGetProjectQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/authentication/AuthContext'
import { AdminRole } from '@/graph/generated/schemas'
import { toast } from '@components/Toaster'

import { Button } from '@/components/Button'
import LoadingBox from '@/components/LoadingBox'

export const DangerForm = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { loading, data } = useGetProjectQuery({
		variables: { id: project_id! },
		skip: !project_id,
	})
	const [name, setName] = useState('')
	const [confirmationText, setConfirmationText] = useState('')

	const { workspaceRole } = useAuthContext()
	const isAdminRole = workspaceRole === AdminRole.Admin

	const [editProject, { loading: editLoading }] = useEditProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetProjects,
			namedOperations.Query.GetProject,
		],
	})

	const [deleteProject, { loading: deleteLoading, data: deleteData }] =
		useDeleteProjectMutation({
			refetchQueries: [namedOperations.Query.GetProjects],
		})

	useEffect(() => {
		if (data?.project) {
			setName(data.project.name)
		}
	}, [data?.project])

	const onSave = (e: React.FormEvent) => {
		e.preventDefault()
		editProject({
			variables: {
				id: project_id!,
				name,
			},
		}).then(() => {
			toast.success('Updated project fields!', { duration: 5000 })
		})
	}

	const onDiscard = () => {
		setName(data?.project?.name || '')
	}

	const onDelete = (e: React.FormEvent) => {
		e.preventDefault()
		deleteProject({ variables: { id: project_id! } })
	}

	const isDirty = name !== (data?.project?.name || '')

	if (deleteData?.deleteProject) {
		return <Navigate replace to="/" />
	}

	return (
		<Stack gap="24">
			<Box
				border="dividerWeak"
				borderRadius="8"
				background="white"
				p="24"
				id="project"
			>
				<Stack gap="16">
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Heading level="h4">Project Properties</Heading>
						{isDirty && (
							<Box display="flex" gap="8">
								<Button
									kind="secondary"
									emphasis="medium"
									trackingId="ProjectSettingsDiscard"
									onClick={onDiscard}
									disabled={!isAdminRole}
								>
									Discard changes
								</Button>
								<Button
									kind="primary"
									emphasis="high"
									trackingId="ProjectSettingsSave"
									onClick={onSave}
									disabled={!isAdminRole}
									loading={editLoading}
								>
									Save changes
								</Button>
							</Box>
						)}
					</Box>

					{loading ? (
						<LoadingBox />
					) : (
						<Form onSubmit={onSave}>
							<Stack gap="16">
								<Box
									display="flex"
									alignItems="center"
									gap="16"
									width="full"
								>
									<Box
										flexShrink={0}
										style={{ width: 100 }}
									>
										<Text weight="bold" size="small">
											Project name
										</Text>
									</Box>
									<Form.Input
										id="projectName"
										name="projectName"
										value={name}
										onChange={(e) => {
											setName(e.target.value)
										}}
										style={{ flexGrow: 1 }}
										disabled={!isAdminRole}
									/>
								</Box>
							</Stack>
						</Form>
					)}
				</Stack>
			</Box>

			{isAdminRole && (
				<Box
					border="dividerWeak"
					borderRadius="8"
					background="white"
					p="24"
					id="danger"
				>
					<Stack gap="16">
						<Heading level="h4">Danger Zone</Heading>

						<Form onSubmit={onDelete}>
							{loading ? (
								<LoadingBox />
							) : (
								<Stack gap="16">
									<Text color="moderate">
										This will immediately delete all session
										and errors in this project. Please type
										'{`${data?.project?.name}`}' to confirm.
									</Text>
									<Box display="flex" gap="8">
										<Form.Input
											placeholder={`${data?.project?.name}`}
											name="confirmationText"
											value={confirmationText}
											onChange={(e) => {
												setConfirmationText(
													e.target.value,
												)
											}}
											style={{ flexGrow: 1 }}
										/>
										<Button
											trackingId="DeleteProject"
											kind="danger"
											emphasis="high"
											disabled={
												confirmationText !==
												data?.project?.name
											}
											type="submit"
											loading={deleteLoading}
										>
											Delete this project
										</Button>
									</Box>
								</Stack>
							)}
						</Form>
					</Stack>
				</Box>
			)}
		</Stack>

	)
}
