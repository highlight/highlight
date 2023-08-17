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
	useGetWorkspacesQuery,
	useSendAdminWorkspaceInviteMutation,
	useUpdateAllowedEmailOriginsMutation,
} from '@graph/hooks'
import {
	Box,
	Callout,
	Form,
	IconSolidPlusSm,
	Stack,
	Text,
	useFormState,
} from '@highlight-run/ui'
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import { Landing } from '@pages/Landing/Landing'
import { SETUP_ROUTE } from '@routers/AppRouter/AppRouter'
import analytics from '@util/analytics'
import { message } from 'antd'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import * as authRouterStyles from './AuthRouter.css'
import * as styles from './InviteTeam.css'

const COMMON_EMAIL_PROVIDERS = [
	'gmail',
	'yahoo',
	'hotmail',
	'fastmail',
	'protonmail',
	'hey.com',
] as const

export const InviteTeamForm: React.FC = () => {
	const { setLoadingState } = useAppLoadingContext()
	const { admin, role } = useAuthContext()
	const navigate = useNavigate()

	const { data: workspacesData, loading: workspacesLoading } =
		useGetWorkspacesQuery({ fetchPolicy: 'network-only' })
	const [updateAllowedEmailOrigins, { loading }] =
		useUpdateAllowedEmailOriginsMutation()
	const [sendInviteEmail] = useSendAdminWorkspaceInviteMutation()

	const adminEmailDomain = getEmailDomain(admin?.email)
	const isCommonEmailDomain = COMMON_EMAIL_PROVIDERS.some(
		(p) => adminEmailDomain.indexOf(p) !== -1,
	)
	const workspace = workspacesData?.workspaces && workspacesData.workspaces[0]
	const inWorkspace = !!workspace

	const formState = useFormState({
		defaultValues: {
			autoJoinDomains: [],
			inviteEmails: '',
			numTeamEmails: 1,
		},
	})

	const disableForm = loading || formState.submitSucceed > 0

	formState.useSubmit(async () => {
		if (disableForm) {
			return
		}

		if (!formState.valid) {
			analytics.track('Invite team submission failed')
			formState.setError(
				'__error',
				'Please fill out all form fields correctly.',
			)
			return
		}

		analytics.track('Invite team submitted')

		try {
			if (inWorkspace) {
				const emails: string[] = [formState.values.inviteEmails]
				for (let i = 0; i < formState.values.numTeamEmails; i++) {
					emails.push(
						(formState.values as any)[
							`${formState.names.inviteEmails}-${i}`
						] as string,
					)
				}
				await Promise.all([
					updateAllowedEmailOrigins({
						variables: {
							workspace_id: workspace.id,
							allowed_auto_join_email_origins:
								formState.values.autoJoinDomains.join(','),
						},
					}),
					...emails.map((email) =>
						sendInviteEmail({
							variables: {
								workspace_id: workspace.id,
								email,
								base_url: window.location.origin,
								role: role.toString(),
							},
						}),
					),
				])
			}

			message.success(`Thanks for inviting your team!`)

			navigate(SETUP_ROUTE)
		} catch (e: any) {
			if (import.meta.env.DEV) {
				console.error(e)
			}

			analytics.track('Invite team submission error')

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
				formState.setValue(formState.names.autoJoinDomains, [
					workspace.name,
				])
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
						{!isCommonEmailDomain && (
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
						<Text
							userSelect="none"
							size="xSmall"
							weight="bold"
							color="weak"
						>
							Invite coworkers to your project
						</Text>
						<Form.Input
							name={formState.names.inviteEmails}
							placeholder="name@example.com"
							required
						/>
						{Array(formState.values.numTeamEmails - 1)
							.fill(0)
							.map((_, idx) => (
								<Form.Input
									key={idx}
									name={`${formState.names.inviteEmails}-${idx}`}
									placeholder="name@example.com"
									required
								/>
							))}
						<Box display="flex">
							<Button
								kind="secondary"
								emphasis="low"
								trackingId="about-you-team-add-another"
								iconLeft={<IconSolidPlusSm />}
								onClick={() =>
									formState.setValue(
										formState.names.numTeamEmails,
										(n: number) => n + 1,
									)
								}
							>
								Add another
							</Button>
						</Box>
						{(formState.errors as any).__error && (
							<Callout kind="error">
								{(formState.errors as any).__error}
							</Callout>
						)}
					</Stack>
				</AuthBody>
				<AuthFooter>
					<Box display="flex" width="full" gap="6">
						<Button
							trackingId="about-you-team-skip"
							disabled={disableForm}
							loading={disableForm}
							kind="secondary"
							emphasis="medium"
							className={styles.formButton}
							onClick={() => {}}
						>
							Skip
						</Button>
						<Button
							trackingId="about-you-team-submit"
							disabled={disableForm}
							loading={disableForm}
							type="submit"
							className={styles.formButton}
						>
							{formState.values.inviteEmails.length
								? 'Invite'
								: 'Save'}
						</Button>
					</Box>
				</AuthFooter>
			</Form>
		</Landing>
	)
}
