import { useAuthContext } from '@authentication/AuthContext'
import {
	AutoJoinEmailsInput,
	getEmailDomain,
} from '@components/AutoJoinEmailsInput'
import { Button } from '@components/Button'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	useGetProjectsAndWorkspacesQuery,
	useGetWorkspacesQuery,
	useUpdateAdminAboutYouDetailsMutation,
	useUpdateAdminAndCreateWorkspaceMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	Box,
	ButtonLink,
	Callout,
	Form,
	Stack,
	Text,
	useFormState,
} from '@highlight-run/ui'
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import { Landing } from '@pages/Landing/Landing'
import analytics from '@util/analytics'
import { getAttributionData } from '@util/attribution'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import * as styles from './AdminForm.css'
import * as authRouterStyles from './AuthRouter.css'

const COMMON_EMAIL_PROVIDERS = [
	'gmail',
	'yahoo',
	'hotmail',
	'fastmail',
	'protonmail',
	'hey.com',
] as const

// IMPORTANT: /about_you is used by google ads for conversion tracking
export const AdminForm: React.FC = () => {
	const { refetch: refetchProjects } = useGetProjectsAndWorkspacesQuery()
	const [showPromoCodeField, setShowPromoCodeField] = useState(false)
	const { setLoadingState } = useAppLoadingContext()
	const { admin, refetchAdmin } = useAuthContext()
	const navigate = useNavigate()
	const { data: workspacesData, loading: workspacesLoading } =
		useGetWorkspacesQuery()
	const [updateAdminAndCreateWorkspace, { loading }] =
		useUpdateAdminAndCreateWorkspaceMutation()
	const [updateAdminAboutYouDetails] = useUpdateAdminAboutYouDetailsMutation()

	if (admin?.about_you_details_filled) {
		navigate('/setup')
	}

	const adminEmailDomain = getEmailDomain(admin?.email)
	const isCommonEmailDomain = COMMON_EMAIL_PROVIDERS.some(
		(p) => adminEmailDomain.indexOf(p) !== -1,
	)

	const workspace = workspacesData?.workspaces && workspacesData.workspaces[0]
	const inWorkspace = !!workspace

	const formState = useFormState({
		defaultValues: {
			firstName: '',
			lastName: '',
			role: '',
			companyName: '',
			autoJoinDomains: '',
			promoCode: '',
		},
	})

	formState.useSubmit(async () => {
		if (!formState.valid) {
			analytics.track('About you submission failed')
			formState.setError(
				'__error',
				'Please fill out all form fields correctly.',
			)
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
							workspace_name: formState.values.companyName,
							allowed_auto_join_email_origins:
								formState.values.autoJoinDomains,
							promo_code: formState.values.promoCode || undefined,
							referral: attributionData.referral,
						},
					},
				})
			}

			message.success(
				`Nice to meet you ${formState.values.firstName}, let's get started!`,
			)

			await refetchProjects()
			await refetchAdmin() // updates admin in auth context
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

			formState.setError('__error', errorMessage)
		}
	})

	useEffect(() => {
		if (!workspacesLoading) {
			setLoadingState(AppLoadingState.LOADED)

			if (inWorkspace) {
				formState.setValue('companyName', workspace.name)
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
				state={formState}
				resetOnSubmit={false}
			>
				<AuthHeader>
					<Text color="moderate">Tell us a bit more</Text>
				</AuthHeader>
				<AuthBody>
					<Stack gap="12">
						<Form.Input
							name={formState.names.firstName}
							label="First Name"
							autoFocus
							required
						/>
						<Form.Input
							name={formState.names.lastName}
							label="Last Name"
							required
						/>
						<Form.Input
							name={formState.names.companyName}
							label="Company"
							disabled={inWorkspace}
							required
						/>
						<Form.NamedSection
							label="Role"
							name={formState.names.role}
							optional
						>
							<select
								className={styles.select}
								value={formState.values.role}
								onChange={(e) =>
									formState.setValue(
										formState.names.role,
										e.target.value,
									)
								}
							>
								<option value="" disabled>
									Select your role
								</option>
								<option value="Product">Product</option>
								<option value="Engineer">Engineering</option>
								<option value="Founder">Founder</option>
							</select>
						</Form.NamedSection>
						{!isCommonEmailDomain && !inWorkspace && (
							<Box mt="4">
								<AutoJoinEmailsInput
									onChange={(domains) =>
										formState.setValue(
											formState.names.autoJoinDomains,
											domains.join(', '),
										)
									}
								/>
							</Box>
						)}
						{!inWorkspace &&
							(showPromoCodeField ? (
								<Form.Input
									name={formState.names.promoCode}
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
						{(formState.errors as any).__error && (
							<Callout kind="error">
								{(formState.errors as any).__error}
							</Callout>
						)}
					</Stack>
				</AuthBody>
				<AuthFooter>
					<Button
						trackingId="about-you-submit"
						loading={loading || formState.submitSucceed > 0}
						type="submit"
					>
						{inWorkspace ? 'Submit' : 'Create Workspace'}
					</Button>
				</AuthFooter>
			</Form>
		</Landing>
	)
}
