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
import { Box, Callout, IconOutlineX, Text } from '@highlight-run/ui'
import AutoJoinForm from '@pages/WorkspaceTeam/components/AutoJoinForm'
import analytics from '@util/analytics'
import { client } from '@util/graph'
import { useParams } from '@util/react-router/useParams'
import { Divider, message } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Navigate, useLocation } from 'react-router-dom'
import { StringParam, useQueryParams } from 'use-query-params'

import Button from '../../components/Button/Button/Button'
import styles from './NewProject.module.css'

const NewProjectPage = () => {
	const { workspace_id } = useParams<{ workspace_id: string }>()
	const [name, setName] = useState<string>('')
	const [autoJoinDomains, setAutoJoinDomains] = useState<string[]>()

	const { data: currentWorkspaceData } = useGetWorkspaceQuery({
		variables: { id: workspace_id! },
		skip: !workspace_id,
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
	const [{ next, promo }] = useQueryParams({
		next: StringParam,
		promo: StringParam,
	})
	const [promoCode, setPromoCode] = useState(promo ?? '')
	const [showPromoCode, setShowPromoCode] = useState(!!promoCode)

	// User is creating a workspace if workspace is not specified in the URL
	const isWorkspace = !workspace_id

	analytics.page('/new', { workspace_id })

	const onSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (isWorkspace) {
			const result = await createWorkspace({
				variables: {
					name: name,
					promo_code: promoCode || undefined,
				},
			})
			const createdWorkspaceId = result.data?.createWorkspace?.id
			analytics.track('CreateWorkspace', { name })
			await client.cache.reset()
			setName('')
			if (createdWorkspaceId && autoJoinDomains?.length) {
				await updateAllowedEmailOrigins({
					variables: {
						allowed_auto_join_email_origins:
							JSON.stringify(autoJoinDomains),
						workspace_id: createdWorkspaceId,
					},
					refetchQueries: [namedOperations.Query.GetWorkspaceAdmins],
				})
			}
		} else {
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
			await client.cache.reset()
			setName('')
		}
	}

	// When a workspace is created, redirect to the 'create project' page
	if (isWorkspace && workspaceData?.createWorkspace?.id) {
		return (
			<Navigate
				replace
				to={`/w/${workspaceData.createWorkspace.id}/new${search}`}
			/>
		)
	}

	// When a project is created, redirect to the 'project setup' page
	if (projectData?.createProject?.id) {
		if (!!next) {
			return <Navigate replace to={next} />
		} else {
			return (
				<Navigate
					replace
					to={`/${projectData.createProject.id}/setup`}
				/>
			)
		}
	}

	const pageTypeCaps = isWorkspace ? 'Workspace' : 'Project'

	return (
		<>
			<Helmet>
				<title>{isWorkspace ? 'New Workspace' : 'New Project'}</title>
			</Helmet>
			<Box
				display="flex"
				borderRadius="8"
				key={workspace_id}
				style={{
					maxWidth: '324px',
				}}
				border="secondary"
				backgroundColor="white"
			>
				<CardForm onSubmit={onSubmit} className={styles.cardForm}>
					<Box
						p="10"
						display="flex"
						alignItems="center"
						justifyContent="space-between"
					>
						<Text cssClass={[styles.noPaddingMargin]} color="n11">
							Create new {pageTypeCaps.toLowerCase()}
						</Text>
						<IconOutlineX
							onClick={() => {
								history.back()
							}}
							strokeWidth="8"
							style={{
								color: '#6F6E77',
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
							placeholder={`${
								isWorkspace ? 'Workspace' : 'Project'
							} name`}
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
								{isWorkspace
									? `This is usually your company name (e.g. Pied Piper), and can contain multiple projects.`
									: `This is usually a single application (e.g. web front end, landing page, etc.).`}
							</Text>
						</Callout>
					</Box>
					{isWorkspace &&
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
					<Box p="8" backgroundColor="raised">
						{isWorkspace && (
							<Box border="secondary" borderRadius="8" p="8">
								<AutoJoinForm
									newWorkspace
									updateOrigins={(domains) => {
										setAutoJoinDomains(domains)
									}}
								/>
							</Box>
						)}
					</Box>
					<Box
						m="0"
						py="4"
						pr="4"
						gap="4"
						display="flex"
						borderRadius="8"
						alignItems="center"
						backgroundColor="raised"
						justifyContent="flex-end"
					>
						{isWorkspace && (
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
						{!isWorkspace &&
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
		</>
	)
}

export default NewProjectPage
