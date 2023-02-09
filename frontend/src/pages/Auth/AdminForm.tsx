import { Button } from '@components/Button'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useUpdateAdminAndCreateWorkspaceMutation } from '@graph/hooks'
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
import AutoJoinForm from '@pages/WorkspaceTeam/components/AutoJoinForm'
import analytics from '@util/analytics'
import { getAttributionData } from '@util/attribution'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import * as styles from './AdminForm.css'
import * as authRouterStyles from './AuthRouter.css'

export const AdminForm: React.FC = () => {
	const [formError, setFormError] = useState('')
	const [showPromoCodeField, setShowPromoCodeField] = useState(false)
	const { setLoadingState } = useAppLoadingContext()
	const history = useHistory()
	const [updateAdminAndCreateWorkspace, { loading }] =
		useUpdateAdminAndCreateWorkspaceMutation()

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

	console.log('::: formState', formState)

	const handleSubmit = async () => {
		if (!formState.valid) {
			analytics.track('About you submission failed')
			setFormError('Please fill out all form fields correctly.')
			return
		}

		setFormError('')
		analytics.track('About you submitted')

		try {
			const attributionData = getAttributionData()
			await updateAdminAndCreateWorkspace({
				variables: {
					admin_and_workspace_details: {
						first_name: formState.values.firstName,
						last_name: formState.values.lastName,
						user_defined_role: formState.values.role,
						workspace_name: formState.values.companyName,
						allowed_auto_join_email_origins:
							formState.values.autoJoinDomains,
						promo_code: formState.values.promoCode || undefined,
						...attributionData,
					},
				},
			})

			message.success(
				`Nice to meet you ${formState.values.firstName}, let's get started!`,
			)
			history.push('/setup')
		} catch (e) {
			if (import.meta.env.DEV) {
				console.error(e)
			}

			analytics.track('About you submission error')
			message.error('Something went wrong. Please try again.')
		}
	}

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	return (
		<Landing>
			<Form
				className={authRouterStyles.container}
				state={formState}
				onSubmit={handleSubmit}
			>
				<AuthHeader>
					<Text color="weak">Tell us a bit more</Text>
				</AuthHeader>
				<AuthBody>
					<Stack gap="6">
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
							required
						/>
						{/* TODO: Refactor to send a single field for role/persona with a dropdown */}
						{/* TODO: Create a Form.Select component */}
						<Form.NamedSection
							label="Role"
							name={formState.names.role}
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
								<option value="" disabled selected>
									Select your role
								</option>
								<option value="product">Product</option>
								<option value="engineer">Engineering</option>
								<option value="founder">Founder</option>
							</select>
						</Form.NamedSection>
						<AutoJoinForm
							// TODO: Email won't work for @gmail addresses.
							newWorkspace
							updateOrigins={(domains) =>
								formState.setValue(
									formState.names.autoJoinDomains,
									domains,
								)
							}
						/>
						{showPromoCodeField ? (
							<Form.Input
								name={formState.names.promoCode}
								label="Promo Code"
							/>
						) : (
							<Box mt="6">
								<ButtonLink
									onClick={() => setShowPromoCodeField(true)}
								>
									+ Add promo code
								</ButtonLink>
							</Box>
						)}
						{formError && (
							<Callout kind="error">{formError}</Callout>
						)}
					</Stack>
				</AuthBody>
				<AuthFooter>
					<Button
						trackingId="about-you-submit"
						disabled={loading}
						type="submit"
					>
						Create Workspace
					</Button>
				</AuthFooter>
			</Form>
		</Landing>
	)
}
