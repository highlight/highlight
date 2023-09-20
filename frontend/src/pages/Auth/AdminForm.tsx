import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	useGetWorkspacesQuery,
	useUpdateAdminAboutYouDetailsMutation,
	useUpdateAdminAndCreateWorkspaceMutation,
} from '@graph/hooks'
import {
	Box,
	ButtonLink,
	Callout,
	Form,
	Stack,
	Text,
	useFormStore,
} from '@highlight-run/ui'
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import { Landing } from '@pages/Landing/Landing'
import { INVITE_TEAM_ROUTE } from '@routers/AppRouter/AppRouter'
import analytics from '@util/analytics'
import { getAttributionData } from '@util/attribution'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from 'react-use'

import { namedOperations } from '@/graph/generated/operations'
import { DISMISS_JOIN_WORKSPACE_LOCAL_STORAGE_KEY } from '@/pages/Auth/JoinWorkspace'

import * as styles from './AdminForm.css'
import * as authRouterStyles from './AuthRouter.css'

enum TeamSize {
	One = '1',
	Two = '2',
	Ten = '3-10',
	Thirty = '11-30',
	Fifty = '31-50',
	Hundred = '51-100',
	FiveHundred = '101-500',
	Thousand = '501-1000+',
}

enum HeardAbout {
	youtube = 'YouTube',
	linkedin = 'LinkedIn',
	twitter = 'Twitter / X',
	google = 'Google',
	other = 'Other',
}

export const AdminForm: React.FC = () => {
	const [showPromoCodeField, setShowPromoCodeField] = useState(false)
	const [error, setError] = useState('')
	const { setLoadingState } = useAppLoadingContext()
	const { admin, fetchAdmin } = useAuthContext()
	const navigate = useNavigate()
	const { data: workspacesData, loading: workspacesLoading } =
		useGetWorkspacesQuery({ fetchPolicy: 'network-only' })
	const [updateAdminAndCreateWorkspace, { loading }] =
		useUpdateAdminAndCreateWorkspaceMutation()
	const [updateAdminAboutYouDetails] = useUpdateAdminAboutYouDetailsMutation()
	const [dismissedJoinWorkspace] = useLocalStorage(
		DISMISS_JOIN_WORKSPACE_LOCAL_STORAGE_KEY,
		false,
	)

	if (admin?.about_you_details_filled) {
		navigate(INVITE_TEAM_ROUTE)
	}

	if (
		!dismissedJoinWorkspace &&
		admin &&
		workspacesData?.joinable_workspaces?.length
	) {
		navigate('/join_workspace', { replace: true })
	}

	const workspace = workspacesData?.workspaces && workspacesData.workspaces[0]
	const inWorkspace = !!workspace

	const formStore = useFormStore({
		defaultValues: {
			firstName: '',
			lastName: '',
			role: '',
			companyName: '',
			promoCode: '',
			teamSize: '',
			heardAbout: '',
		},
	})

	const submitSucceeded = formStore.useState('submitSucceed')
	const disableForm = loading || submitSucceeded > 0

	formStore.useSubmit(async (formState) => {
		if (disableForm) {
			return
		}

		if (!formState.valid) {
			analytics.track('About you submission failed')
			setError('Please fill out all form fields correctly.')
			return
		}

		analytics.track('About you submitted')

		try {
			const attributionData = getAttributionData()

			if (inWorkspace) {
				await updateAdminAboutYouDetails({
					awaitRefetchQueries: true,
					refetchQueries: [
						namedOperations.Query.GetProjectsAndWorkspaces,
					],
					variables: {
						adminDetails: {
							first_name: formState.values.firstName,
							last_name: formState.values.lastName,
							user_defined_role: formState.values.role,
							user_defined_persona: '',
							user_defined_team_size: formState.values.teamSize,
							heard_about: formState.values.heardAbout,
							referral: attributionData.referral,
						},
					},
				})
			} else {
				await updateAdminAndCreateWorkspace({
					awaitRefetchQueries: true,
					refetchQueries: [
						namedOperations.Query.GetProjectsAndWorkspaces,
					],
					variables: {
						admin_and_workspace_details: {
							first_name: formState.values.firstName,
							last_name: formState.values.lastName,
							user_defined_role: formState.values.role,
							user_defined_team_size: formState.values.teamSize,
							workspace_name: formState.values.companyName,
							promo_code: formState.values.promoCode || undefined,
							heard_about: formState.values.heardAbout,
							referral: attributionData.referral,
						},
					},
				})
			}

			message.success(
				`Nice to meet you ${formState.values.firstName}, let's get started!`,
			)

			await fetchAdmin() // updates admin in auth context
			navigate(INVITE_TEAM_ROUTE)
		} catch (e: any) {
			if (import.meta.env.DEV) {
				console.error(e)
			}

			analytics.track('About you submission error')

			let errorMessage
			try {
				errorMessage = e.message.split(':').at(-1).trim()
			} catch {
				errorMessage = 'Something went wrong. Please try again.'
			}

			setError(errorMessage)
		}
	})

	useEffect(() => {
		if (!workspacesLoading) {
			setLoadingState(AppLoadingState.LOADED)

			if (inWorkspace) {
				formStore.setValue('companyName', workspace.name)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workspace?.name, workspacesLoading])

	if (workspacesLoading) {
		return null
	}

	return (
		<Landing>
			<Form
				className={authRouterStyles.container}
				store={formStore}
				resetOnSubmit={false}
			>
				<AuthHeader>
					<Text color="moderate">Tell us a bit more</Text>
				</AuthHeader>
				<AuthBody>
					<Stack gap="12">
						<Stack direction="column" gap="4">
							<Form.Label
								label="Your Name"
								name={formStore.names.firstName}
							/>
							<Stack gap="0">
								<Form.Input
									name={formStore.names.firstName}
									placeholder="First Name"
									autoFocus
									required
									rounded="first"
								/>
								<Form.Input
									name={formStore.names.lastName}
									placeholder="Last Name"
									required
									rounded="last"
								/>
							</Stack>
						</Stack>
						<Form.Input
							name={formStore.names.companyName}
							label="Company"
							disabled={inWorkspace}
							required
						/>

						<Form.Select
							className={styles.select}
							name={formStore.names.role}
							label="Role"
							optional
						>
							<option value="" disabled>
								Select your role
							</option>
							<option value="Product">Product</option>
							<option value="Engineer">Engineering</option>
							<option value="Founder">Founder</option>
						</Form.Select>
						<Form.Select
							className={styles.select}
							name={formStore.names.teamSize}
							label="Team Size"
							optional
						>
							<option value="" disabled>
								Select your team size
							</option>
							{Object.entries(TeamSize).map(([k, v]) => (
								<option value={k} key={k}>
									{v}
								</option>
							))}
						</Form.Select>
						<Form.Select
							className={styles.select}
							name={formStore.names.heardAbout}
							label="Where did you hear about us?"
							optional
						>
							<option value="" disabled>
								Select where you heard about us
							</option>
							{Object.entries(HeardAbout).map(([k, v]) => (
								<option value={k} key={k}>
									{v}
								</option>
							))}
						</Form.Select>
						{!inWorkspace &&
							(showPromoCodeField ? (
								<Form.Input
									name={formStore.names.promoCode}
									label="Promo Code"
								/>
							) : (
								<Box mt="4">
									<ButtonLink
										onClick={() =>
											setShowPromoCodeField(true)
										}
									>
										+ Add promo code
									</ButtonLink>
								</Box>
							))}
						{error && <Callout kind="error">{error}</Callout>}
					</Stack>
				</AuthBody>
				<AuthFooter>
					<Button
						trackingId="about-you-submit"
						disabled={disableForm}
						loading={disableForm}
						type="submit"
					>
						{inWorkspace ? 'Submit' : 'Create Workspace'}
					</Button>
				</AuthFooter>
			</Form>
		</Landing>
	)
}
