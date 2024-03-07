import { InfoCircleFilled } from '@ant-design/icons'
import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import { CardForm } from '@components/Card/Card'
import Input from '@components/Input/Input'
import { CircularSpinner } from '@components/Loading/Loading'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	useCreateProjectMutation,
	useCreateWorkspaceMutation,
	useGetWorkspaceQuery,
	useGetWorkspacesCountQuery,
	useUpdateAllowedEmailOriginsMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Box, Callout, Text } from '@highlight-run/ui/components'
import analytics from '@util/analytics'
import { client } from '@util/graph'
import { Divider, message } from 'antd'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Navigate, useLocation } from 'react-router-dom'
import { StringParam, useQueryParams } from 'use-query-params'

import { authRedirect } from '@/pages/Auth/utils'
import SvgCloseIcon from '@/static/CloseIcon'

import Button from '../../components/Button/Button/Button'
import { AutoJoinInput } from './AutoJoinInput'
import styles from './NewProject.module.css'

const NewProjectPage = ({ workspace_id }: { workspace_id?: string }) => {
	// User is creating a new workspace if workspace_id is not specified in props
	const isNewWorkspace = !workspace_id
	if (workspace_id) analytics.page('/new', { workspace_id })
	const [name, setName] = useState<string>('')
	const [visible, setVisible] = useState<boolean>(true)
	const [autoJoinDomains, setAutoJoinDomains] = useState<string[]>([])

	const { data: currentWorkspaceData } = useGetWorkspaceQuery({
		skip: isNewWorkspace,
		variables: { id: workspace_id || '-1' },
	})

	const [
		createProject,
		{ loading: projectLoading, data: projectData, error: projectError },
	] = useCreateProjectMutation()

	const [
		createWorkspace,
		{
			loading: workspaceLoading,
			data: workspaceData,
			error: workspaceError,
		},
	] = useCreateWorkspaceMutation()
	const [updateAllowedEmailOrigins] = useUpdateAllowedEmailOriginsMutation()
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		if (projectError || workspaceError) {
			const err = projectError?.message ?? workspaceError?.message
			message.error(err)
		}
	}, [projectError, workspaceError])

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	const { data, loading } = useGetWorkspacesCountQuery()

	const { search } = useLocation()
	const [{ promo }] = useQueryParams({
		promo: StringParam,
	})
	const [promoCode, setPromoCode] = useState(promo ?? '')
	const [showPromoCode, setShowPromoCode] = useState(!!promoCode)

	const onSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (isNewWorkspace) {
			const result = await createWorkspace({
				variables: {
					name: name,
					promo_code: promoCode || undefined,
				},
			})
			const createdWorkspaceId = result.data?.createWorkspace?.id
			analytics.track('CreateWorkspace', { name })
			setName('')
			if (createdWorkspaceId && autoJoinDomains.length) {
				await updateAllowedEmailOrigins({
					variables: {
						allowed_auto_join_email_origins:
							JSON.stringify(autoJoinDomains),
						workspace_id: createdWorkspaceId,
					},
					refetchQueries: [namedOperations.Query.GetWorkspaceAdmins],
				})
			}
		} else if (workspace_id) {
			await createProject({
				variables: {
					name: name,
					workspace_id,
				},
				refetchQueries: [
					namedOperations.Query.GetProjects,
					namedOperations.Query.GetProjectDropdownOptions,
					namedOperations.Query.GetProjectsAndWorkspaces,
				],
			})
			analytics.track('CreateProject', { name })
			setName('')
		}

		await client.cache.reset()
	}

	// When a workspace is created, redirect to the 'create project' page
	if (isNewWorkspace && workspaceData?.createWorkspace?.id) {
		return (
			<Navigate
				replace
				to={`/w/${workspaceData.createWorkspace.id}/new${search}`}
			/>
		)
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

	const pageTypeCaps = isNewWorkspace ? 'Workspace' : 'Project'

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
							<Callout
								style={{
									border: 0,
									padding: 0,
								}}
								icon={() => (
									<InfoCircleFilled
										style={{
											color: '#6F6E77CC',
										}}
									/>
								)}
							>
								<Text color="n11">
									{isNewWorkspace
										? `This is usually your company name (e.g. Pied Piper), and can contain multiple projects.`
										: `This is usually a single application (e.g. web front end, landing page, etc.).`}
								</Text>
							</Callout>
						</Box>
						{isNewWorkspace &&
							(showPromoCode ? (
								<Box
									py="8"
									px="12"
									display="flex"
									flexDirection="column"
								>
									<Text weight="medium" color="n11">
										Promocode
									</Text>
									<Input
										value={promoCode}
										onChange={(e) => {
											setPromoCode(e.target.value)
										}}
										className={styles.inputField}
										placeholder="Enter a promo code"
									/>
								</Box>
							) : (
								<Box
									py="8"
									px="12"
									gap="16"
									display="flex"
									flexDirection="column"
								>
									<span
										onClick={() => {
											setShowPromoCode(true)
										}}
										className={styles.promoCodeToggle}
									>
										+ Add a promo code
									</span>
								</Box>
							))}
						{isNewWorkspace && (
							<Box p="8" backgroundColor="raised">
								<Box border="secondary" borderRadius="8" p="8">
									<AutoJoinInput
										autoJoinDomains={autoJoinDomains}
										setAutoJoinDomains={setAutoJoinDomains}
									/>
								</Box>
							</Box>
						)}
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
							mt={isNewWorkspace ? '0' : '8'}
						>
							{isNewWorkspace && (
								<ButtonLink
									type="text"
									to={`/switch${search}`}
									className={clsx(
										styles.button,
										styles.transparent,
									)}
									trackingId={`Enter${pageTypeCaps}`}
								>
									<Text color="n11">Enter existing</Text>
									{!loading &&
										!!data &&
										data.workspaces_count !== 0 && (
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
													{data.workspaces_count}
												</Text>
											</Box>
										)}
								</ButtonLink>
							)}
							{!isNewWorkspace &&
								currentWorkspaceData?.workspace &&
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
										{!loading && (
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
										)}
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
								{projectLoading || workspaceLoading ? (
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
