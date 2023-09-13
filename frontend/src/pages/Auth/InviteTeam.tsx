import { useAuthContext } from '@authentication/AuthContext'
import { getEmailDomain } from '@components/AutoJoinEmailsInput'
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
	IconSolidCheckCircle,
	IconSolidPlusSm,
	Stack,
	SwitchButton,
	Text,
	useFormStore,
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
	const [error, setError] = React.useState<string>()

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

	const formStore = useFormStore({
		defaultValues: {
			autoJoinDomain: true,
			inviteEmails: '',
			numTeamEmails: 1,
		},
	})
	const autoJoinDomain = formStore.useValue(formStore.names.autoJoinDomain)
	const numTeamEmails = formStore.useValue(formStore.names.numTeamEmails)
	const submitSucceed = formStore.useState('submitSucceed')
	const disableForm = loading || submitSucceed > 0

	formStore.useSubmit(async (formState) => {
		if (disableForm) {
			return
		}

		if (!formState.valid) {
			analytics.track('Invite team submission failed')
			setError('Please fill out all form fields correctly.')
			return
		}

		analytics.track('Invite team submitted')

		try {
			if (inWorkspace) {
				let emails: string[] = [formState.values.inviteEmails]
				for (let i = 0; i < formState.values.numTeamEmails; i++) {
					emails.push(
						(formState.values as any)[
							`${formStore.names.inviteEmails}-${i}`
						] as string,
					)
				}
				emails = emails.filter((e) => e?.length)
				try {
					await Promise.all([
						updateAllowedEmailOrigins({
							variables: {
								workspace_id: workspace.id,
								allowed_auto_join_email_origins: formState
									.values.autoJoinDomain
									? getEmailDomain(admin?.email)
									: '',
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
				} catch (e) {
					message.error(
						`An error occurred inviting your team. Please try again later.`,
					)
					return navigate(SETUP_ROUTE)
				}

				if (emails.length) {
					message.success(`Thanks for inviting your team!`)
				} else {
					message.info(`You can always invite your team later.`)
				}
			}

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

			setError(errorMessage)
		}
	})

	useEffect(() => {
		if (!workspacesLoading) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [setLoadingState, workspacesLoading])

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
					<Text color="moderate">Invite your team</Text>
				</AuthHeader>
				<AuthBody>
					<Stack gap="12">
						<Text
							userSelect="none"
							size="xSmall"
							weight="medium"
							color="weak"
						>
							Invite coworkers to your project
						</Text>
						<Stack gap="6">
							<Form.Input
								name={formStore.names.inviteEmails}
								placeholder="name@example.com"
								type="email"
								autoFocus
								autoComplete="email"
							/>
							{Array(numTeamEmails - 1)
								.fill(0)
								.map((_, idx) => (
									<Form.Input
										key={idx}
										name={`${formStore.names.inviteEmails}-${idx}`}
										placeholder="name@example.com"
										autoComplete="email"
									/>
								))}
						</Stack>
						<Box display="flex">
							<Button
								kind="secondary"
								emphasis="low"
								trackingId="about-you-team-add-another"
								iconLeft={<IconSolidPlusSm />}
								onClick={() =>
									formStore.setValue(
										formStore.names.numTeamEmails,
										(n: number) => n + 1,
									)
								}
							>
								Add another
							</Button>
						</Box>
						{error && <Callout kind="error">{error}</Callout>}
					</Stack>
				</AuthBody>
				<AuthFooter>
					<Stack gap="12">
						<Box display="flex" width="full">
							{!isCommonEmailDomain && (
								<Box width="full">
									<Callout icon={false}>
										<Stack gap="8">
											<Box
												display="flex"
												alignItems="center"
												gap="6"
											>
												<SwitchButton
													type="button"
													size="xxSmall"
													iconLeft={
														<IconSolidCheckCircle
															size={12}
														/>
													}
													checked={autoJoinDomain}
													onChange={() => {
														formStore.setValue(
															formStore.names
																.autoJoinDomain,
															!autoJoinDomain,
														)
													}}
												/>
												<Text
													size="small"
													weight="bold"
													color="strong"
												>
													Allow joining by email
													domain
												</Text>
											</Box>
											<Text size="small" weight="medium">
												Allow everyone with a{' '}
												<b>
													{getEmailDomain(
														admin?.email,
													)}
												</b>{' '}
												email to join your workspace.
											</Text>
										</Stack>
									</Callout>
								</Box>
							)}
						</Box>
						<Box display="flex" width="full">
							<Button
								trackingId="about-you-team-submit"
								disabled={disableForm}
								loading={disableForm}
								type="submit"
								className={styles.formButton}
							>
								Next
							</Button>
						</Box>
					</Stack>
				</AuthFooter>
			</Form>
		</Landing>
	)
}
