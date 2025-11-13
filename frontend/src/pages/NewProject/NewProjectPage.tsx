import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import { CardForm } from '@components/Card/Card'
import Input from '@components/Input/Input'
import { CircularSpinner } from '@components/Loading/Loading'
import { toast } from '@components/Toaster'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useCreateProjectMutation, useGetWorkspaceQuery } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Box, Callout, Stack, Text } from '@highlight-run/ui/components'
import analytics from '@util/analytics'
import { client } from '@util/graph'
import { Divider } from 'antd'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Navigate, useLocation } from 'react-router-dom'

import { authRedirect } from '@/pages/Auth/utils'
import SvgCloseIcon from '@/static/CloseIcon'

import Button from '../../components/Button/Button/Button'
import styles from './NewProject.module.css'

const NewProjectPage = ({ workspace_id }: { workspace_id: string }) => {
	if (workspace_id) analytics.page('/new', { workspace_id })
	const [name, setName] = useState<string>('')
	const [visible, setVisible] = useState<boolean>(true)

	const { data: currentWorkspaceData } = useGetWorkspaceQuery({
		variables: { id: workspace_id! },
	})

	const [
		createProject,
		{ loading: projectLoading, data: projectData, error: projectError },
	] = useCreateProjectMutation({
		refetchQueries: [namedOperations.Query.GetWorkspaceSettings],
	})

	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		if (projectError) {
			toast.error(projectError.message)
		}
	}, [projectError])

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	const { search } = useLocation()

	const onSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (workspace_id) {
			await createProject({
				variables: {
					name: name,
					workspace_id,
				},
				refetchQueries: [
					namedOperations.Query.GetProjects,
					namedOperations.Query.GetDropdownOptions,
					namedOperations.Query.GetProjectsAndWorkspaces,
				],
			})
			analytics.track('CreateProject', { name })
			setName('')
		}

		await client.cache.reset()
	}

	// When a project is created, redirect to the 'project setup' page
	if (projectData?.createProject?.id) {
		const authRedirectRoute = authRedirect.get()
		if (!!authRedirectRoute) {
			return <Navigate replace to={authRedirectRoute} />
		} else {
			return (
				<Navigate
					replace
					to={`/${projectData.createProject.id}/setup`}
				/>
			)
		}
	}

	const pageTypeCaps = 'Project'

	return visible ? (
		<>
			<Helmet>
				<title>New {pageTypeCaps}</title>
			</Helmet>
			<Box
				width="screen"
				display="flex"
				height="screen"
				position="fixed"
				alignItems="flex-start"
				justifyContent="center"
				style={{
					zIndex: '30000',
					overflow: 'hidden',
					backgroundColor: '#6F6E777A',
				}}
			>
				<Box
					display="flex"
					borderRadius="8"
					border="secondary"
					key={workspace_id}
					style={{
						marginTop: 'auto',
						marginBottom: 'auto',
						maxWidth: '324px',
					}}
					backgroundColor="white"
				>
					<CardForm onSubmit={onSubmit} className={styles.cardForm}>
						<Box
							p="10"
							display="flex"
							alignItems="center"
							justifyContent="space-between"
						>
							<Text
								cssClass={[styles.noPaddingMargin]}
								color="n11"
							>
								Create new {pageTypeCaps.toLowerCase()}
							</Text>
							<SvgCloseIcon
								width="18px"
								height="18px"
								strokeWidth="8"
								color="#6F6E77"
								cursor="pointer"
								onClick={() => {
									setVisible(false)
									history.back()
								}}
							/>
						</Box>
						<Divider className="m-0" />
						<Box
							py="8"
							px="12"
							gap="16"
							display="flex"
							flexDirection="column"
						>
							<Input
								autoFocus
								name="name"
								value={name}
								autoComplete="off"
								onChange={(e) => {
									setName(e.target.value)
								}}
								className={styles.inputField}
								placeholder={`${pageTypeCaps} name`}
							/>
							<Stack gap="8" justify="flex-start">
								<Callout style={{ padding: 0, border: 0 }}>
									<Box mt="6">
										<Text color="n11">
											This is usually a single application
											(e.g. web front end, landing page,
											etc.).
										</Text>
									</Box>
								</Callout>
							</Stack>
						</Box>
						<Box
							my="0"
							py="4"
							pr="4"
							gap="4"
							display="flex"
							borderRadius="8"
							alignItems="center"
							backgroundColor="raised"
							justifyContent="flex-end"
							mt="8"
						>
							{currentWorkspaceData?.workspace &&
								currentWorkspaceData.workspace.projects.length >
									0 && (
									<ButtonLink
										type="text"
										trackingId={`Enter${pageTypeCaps}`}
										to={`/w/${workspace_id}/switch${search}`}
										className={clsx(
											styles.button,
											styles.transparent,
										)}
									>
										<Text color="n11">
											Enter existing project
										</Text>
										<Box
											ml="4"
											px="3"
											py="3"
											display="flex"
											borderRadius="4"
											border="secondary"
											alignItems="center"
											justifyContent="center"
										>
											<Text size="xSmall" color="n11">
												{
													currentWorkspaceData
														.workspace.projects
														.length
												}
											</Text>
										</Box>
									</ButtonLink>
								)}
							<Button
								type="primary"
								htmlType="submit"
								disabled={name.length === 0}
								className={clsx(
									styles.button,
									name.length === 0 && styles.createDisabled,
								)}
								trackingId={`Create${pageTypeCaps}`}
							>
								{projectLoading ? (
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
						</Box>
					</CardForm>
				</Box>
			</Box>
		</>
	) : null
}

export default NewProjectPage
