import { Button } from '@components/Button'
import { toast } from '@components/Toaster'
import {
	useCreateAdminMutation,
	useGetWorkspaceForInviteLinkQuery,
} from '@graph/hooks'
import {
	Box,
	Callout,
	Form,
	Heading,
	IconSolidGithub,
	IconSolidGoogle,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import { SIGN_IN_ROUTE } from '@pages/Auth/AuthRouter'
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { auth } from '@util/auth'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import firebase from 'firebase/compat/app'
import React, { useCallback, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { VERIFY_EMAIL_ROUTE } from '@/routers/AppRouter/AppRouter'

export const SignUp: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { fetchAdmin, signIn } = useAuthContext()
	const initialEmail: string = location.state?.email ?? ''
	const [inviteCode] = useLocalStorage('highlightInviteCode')
	const [error, setError] = React.useState('')
	const formStore = Form.useStore({
		defaultValues: {
			email: initialEmail,
			password: '',
		},
	})
	const email = formStore.useValue('email')
	const [loading, setLoading] = React.useState(false)
	formStore.useSubmit(async (formState) => {
		setLoading(true)

		auth.createUserWithEmailAndPassword(
			formState.values.email,
			formState.values.password,
		)
			.then(handleSubmit)
			.catch((error) => {
				setError(error.message || error.toString())
				setLoading(false)
			})
	})

	const [createAdmin] = useCreateAdminMutation()
	const { data } = useGetWorkspaceForInviteLinkQuery({
		variables: {
			secret: inviteCode!,
		},
		skip: !inviteCode,
		onCompleted: (data) => {
			if (
				data?.workspace_for_invite_link.invitee_email &&
				!initialEmail
			) {
				formStore.setValue(
					'email',
					data?.workspace_for_invite_link.invitee_email,
				)
			}
		},
	})
	const workspaceInvite = data?.workspace_for_invite_link

	const handleSubmit = useCallback(
		async ({ additionalUserInfo, user }: firebase.auth.UserCredential) => {
			const isNewUser = additionalUserInfo?.isNewUser && user?.email

			if (isNewUser) {
				analytics.track('Sign up', {
					email: user.email!,
					provider: additionalUserInfo.providerId,
				})

				analytics.trackGaEvent('sign_up', {
					email: user.email!,
					provider: additionalUserInfo.providerId,
				})

				if (!user?.emailVerified) {
					auth.currentUser?.sendEmailVerification()
				}

				await createAdmin()
				toast.success('Account created successfully!')
			}

			await fetchAdmin()
			signIn(user)

			if (isNewUser) {
				navigate(VERIFY_EMAIL_ROUTE, { replace: true })
			}
		},
		[createAdmin, navigate, signIn, fetchAdmin],
	)

	const handleExternalAuthClick = (provider: firebase.auth.AuthProvider) => {
		auth.signInWithPopup(provider)
			.then(handleSubmit)
			.catch((error: firebase.auth.MultiFactorError) => {
				let errorMessage = error.message

				if (error.code === 'auth/popup-closed-by-user') {
					errorMessage =
						'Pop-up closed without successfully authenticating. Please try again.'
				}

				setError(errorMessage)
			})
	}

	useEffect(() => analytics.page('Sign Up'), [])

	return (
		<Form store={formStore} resetOnSubmit={false}>
			<AuthHeader>
				<Box mb="4">
					<Stack direction="column" gap="16" align="center">
						<SvgHighlightLogoOnLight height="48" width="48" />
						<Heading level="h4">
							{workspaceInvite
								? `You're invited to join ‘${workspaceInvite.workspace_name}’`
								: 'Welcome to Highlight.'}
						</Heading>
						<Text>
							Have an account?{' '}
							<Link to={SIGN_IN_ROUTE} state={{ email }}>
								Sign in
							</Link>
							.
						</Text>
					</Stack>
				</Box>
			</AuthHeader>
			<AuthBody>
				<Stack gap="12">
					<Form.Input
						name={formStore.names.email}
						label="Email"
						type="email"
						autoFocus
						autoComplete="email"
					/>
					<Form.Input
						name={formStore.names.password}
						label="Password"
						type="password"
						minLength={8}
						autoComplete="new-password"
					/>
					{error && <Callout kind="error">{error}</Callout>}
				</Stack>
			</AuthBody>
			<AuthFooter>
				<Stack gap="12">
					<Button
						onClick={() => null}
						trackingId="sign-up-submit"
						loading={loading}
						type="submit"
					>
						Sign up
					</Button>
					{isOnPrem ? null : (
						<>
							<Stack direction="row" align="center">
								<Box
									borderTop="divider"
									style={{ height: 0, flexGrow: 1 }}
								/>
								<Text color="weak" size="xSmall" align="center">
									or
								</Text>
								<Box
									borderTop="divider"
									style={{ height: 0, flexGrow: 1 }}
								/>
							</Stack>
							<Button
								kind="secondary"
								type="button"
								trackingId="sign-up-with-google"
								onClick={() => {
									handleExternalAuthClick(
										auth.googleProvider!,
									)
								}}
							>
								<Box display="flex" alignItems="center" gap="6">
									<IconSolidGoogle />
									Sign up with Google
								</Box>
							</Button>
							<Button
								kind="secondary"
								type="button"
								trackingId="sign-up-with-github"
								onClick={() =>
									handleExternalAuthClick(
										auth.githubProvider!,
									)
								}
							>
								<Box display="flex" alignItems="center" gap="6">
									<IconSolidGithub />
									Sign up with Github
								</Box>
							</Button>
						</>
					)}
				</Stack>
			</AuthFooter>
		</Form>
	)
}
