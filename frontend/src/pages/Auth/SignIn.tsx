import { Button } from '@components/Button'
import {
	useCreateAdminMutation,
	useGetWorkspaceForInviteLinkQuery,
} from '@graph/hooks'
import {
	Box,
	Form,
	Heading,
	IconSolidGithub,
	IconSolidGoogle,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import { AuthBody, AuthError, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import useLocalStorage from '@rehooks/local-storage'
import { auth } from '@util/auth'
import firebase from 'firebase/compat/app'
import React, { useCallback, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { AUTH_MODE } from '@/constants'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@/context/AppLoadingContext'
import { SIGN_UP_ROUTE } from '@/pages/Auth/AuthRouter'
import { VERIFY_EMAIL_ROUTE } from '@/routers/AppRouter/AppRouter'
import analytics from '@/util/analytics'

type Props = {
	setResolver: React.Dispatch<
		React.SetStateAction<firebase.auth.MultiFactorResolver | undefined>
	>
}

export const SignIn: React.FC<Props> = ({ setResolver }) => {
	const navigate = useNavigate()
	const { fetchAdmin, signIn } = useAuthContext()
	const { setLoadingState } = useAppLoadingContext()
	const [inviteCode] = useLocalStorage('highlightInviteCode')
	const [loading, setLoading] = React.useState(false)
	const [error, setError] = React.useState('')
	const location = useLocation()

	const initialEmail: string = location.state?.email ?? ''
	const formStore = Form.useStore({
		defaultValues: {
			email: initialEmail,
			password: '',
		},
	})
	const email = formStore.useValue('email')
	formStore.useSubmit(async (formState) => {
		setLoading(true)

		auth.signInWithEmailAndPassword(
			formState.values.email,
			formState.values.password,
		)
			.then(handleAuth)
			.catch(handleAuthError)
	})

	const [createAdmin] = useCreateAdminMutation()
	const { data, loading: loadingWorkspaceForInvite } =
		useGetWorkspaceForInviteLinkQuery({
			variables: {
				secret: inviteCode!,
			},
			skip: !inviteCode,
		})
	const workspaceInvite = data?.workspace_for_invite_link

	const handleAuth = useCallback(
		async ({ additionalUserInfo, user }: firebase.auth.UserCredential) => {
			const isNewUser = additionalUserInfo?.isNewUser && user?.email

			if (isNewUser) {
				analytics.track('Sign up', {
					email: user.email!,
					provider: additionalUserInfo.providerId,
				})

				if (!user?.emailVerified) {
					auth.currentUser?.sendEmailVerification()
				}

				await createAdmin()
			}

			await fetchAdmin()
			signIn(user)

			if (isNewUser) {
				navigate(VERIFY_EMAIL_ROUTE, { replace: true })
			}
		},
		[createAdmin, fetchAdmin, signIn, navigate],
	)

	const handleAuthError = useCallback(
		(error: firebase.auth.MultiFactorError) => {
			let errorMessage = error.message

			if (error.code == 'auth/multi-factor-auth-required') {
				setResolver(error.resolver)
				navigate('/multi_factor')
				return
			}

			if (error.code === 'auth/popup-closed-by-user') {
				errorMessage =
					'Pop-up closed without successfully authenticating. Please try again.'
			}

			setError(errorMessage)
			setLoading(false)
		},
		[navigate, setResolver],
	)

	const handleExternalAuthClick = (provider: firebase.auth.AuthProvider) => {
		auth.signInWithPopup(provider).then(handleAuth).catch(handleAuthError)
	}

	useEffect(() => analytics.page('Sign In'), [])
	useEffect(() => {
		if (!loadingWorkspaceForInvite) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [loadingWorkspaceForInvite, setLoadingState])

	return (
		<Form store={formStore} resetOnSubmit={false}>
			<AuthHeader>
				<Box mb="4">
					<Stack direction="column" gap="16" align="center">
						<SvgHighlightLogoOnLight height="48" width="48" />
						<Heading level="h4">
							{workspaceInvite
								? `You're invited to join ‘${workspaceInvite.workspace_name}’`
								: 'Welcome back.'}
						</Heading>
						{AUTH_MODE !== 'oauth' ? (
							<Text>
								New here?{' '}
								<Link to={SIGN_UP_ROUTE} state={{ email }}>
									Create an account
								</Link>
								.
							</Text>
						) : null}
					</Stack>
				</Box>
			</AuthHeader>
			{AUTH_MODE === 'oauth' ? null : (
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
							autoComplete="current-password"
						/>
						<Link to="/reset_password" state={{ email }}>
							<Text size="xSmall">Forgot your password?</Text>
						</Link>
						{error && <AuthError>{error}</AuthError>}
					</Stack>
				</AuthBody>
			)}

			<AuthFooter>
				<Stack gap="12">
					<Button
						trackingId="sign-up-submit"
						loading={loading}
						type="submit"
						id="email-password-signin"
					>
						Sign in
						{AUTH_MODE === 'oauth' ? <>{' with SSO'}</> : null}
					</Button>
					{AUTH_MODE !== 'firebase' ? null : (
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
								trackingId="sign-in-with-google"
								onClick={() => {
									handleExternalAuthClick(
										auth.googleProvider!,
									)
								}}
							>
								<Box display="flex" alignItems="center" gap="6">
									<IconSolidGoogle />
									Sign in with Google
								</Box>
							</Button>
							<Button
								kind="secondary"
								type="button"
								trackingId="sign-in-with-github"
								onClick={() => {
									handleExternalAuthClick(
										auth.githubProvider!,
									)
								}}
							>
								<Box display="flex" alignItems="center" gap="6">
									<IconSolidGithub />
									Sign in with Github
								</Box>
							</Button>
						</>
					)}
				</Stack>
			</AuthFooter>
		</Form>
	)
}
