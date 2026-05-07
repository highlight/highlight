import { toast } from '@components/Toaster'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useCreateProjectMutation, useGetWorkspaceQuery } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	Box,
	ButtonIcon,
	Callout,
	IconSolidLoading,
	IconSolidX,
	Input,
	Stack,
	Text,
	Button,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import analytics from '@util/analytics'
import { client } from '@util/graph'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Navigate, useLocation } from 'react-router-dom'

import { authRedirect } from '@/pages/Auth/utils'

import { LinkButton } from '../../components/LinkButton'

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

	const onSubmit = async (e: React.FormEvent) => {
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

	if (!visible) {
		return null
	}

	return (
		<>
			<Helmet>
				<title>New {pageTypeCaps}</title>
			</Helmet>
			<Box
				width="screen"
				display="flex"
				height="screen"
				position="fixed"
				alignItems="center"
				justifyContent="center"
				style={{
					zIndex: '30000',
					overflow: 'hidden',
					backgroundColor: 'rgba(111, 110, 119, 0.48)',
				}}
			>
				<Box
					display="flex"
					flexDirection="column"
					borderRadius="8"
					border="secondary"
					key={workspace_id}
					backgroundColor="white"
					width="full"
					style={{ maxWidth: '324px' }}
					as="form"
					onSubmit={onSubmit}
				>
					<Box
						p="10"
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						borderBottom="dividerWeak"
					>
						<Text color="n11" weight="medium">
							Create new {pageTypeCaps.toLowerCase()}
						</Text>
						<ButtonIcon
							kind="secondary"
							emphasis="none"
							size="xSmall"
							onClick={() => {
								setVisible(false)
								history.back()
							}}
							icon={
								<IconSolidX
									size={16}
									color={vars.theme.static.content.weak}
								/>
							}
						/>
					</Box>
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
							placeholder={`${pageTypeCaps} name`}
						/>
						<Stack gap="8" justify="flex-start">
							<Callout>
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
						py="4"
						px="4"
						gap="4"
						display="flex"
						borderRadius="8"
						alignItems="center"
						backgroundColor="raised"
						justifyContent="flex-end"
					>
						{currentWorkspaceData?.workspace &&
							currentWorkspaceData.workspace.projects.length >
								0 && (
								<LinkButton
									trackingId={`Enter${pageTypeCaps}`}
									to={`/w/${workspace_id}/switch${search}`}
									kind="secondary"
									emphasis="low"
								>
									<Box
										display="flex"
										alignItems="center"
										gap="4"
									>
										<Text color="n11">
											Enter existing project
										</Text>
										<Box
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
									</Box>
								</LinkButton>
							)}
						<Button
							type="submit"
							disabled={name.length === 0 || projectLoading}
							onClick={() => {
								analytics.track(`Button-Create${pageTypeCaps}`)
							}}
						>
							{projectLoading ? (
								<IconSolidLoading />
							) : (
								`Create ${pageTypeCaps}`
							)}
						</Button>
					</Box>
				</Box>
			</Box>
		</>
	)
}

export default NewProjectPage
