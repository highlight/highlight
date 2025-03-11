import { Button } from '@components/Button'
import {
	useCreateAdminMutation,
	useGetSsoLoginLazyQuery,
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
import { EXPECTED_REDIRECT, getAuth } from '@util/auth'
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
import { Cookies, upsertCookie } from '@util/cookie'

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
			passwordRequired: false,
		},
	})
	const email = formStore.useValue('email')
	const passwordRequired = formStore.useValue('passwordRequired')

	const [createAdmin] = useCreateAdminMutation()
	const { data, loading: loadingWorkspaceForInvite } =
		useGetWorkspaceForInviteLinkQuery({
			variables: {
				secret: inviteCode!,
			},
			skip: !inviteCode,
		})
	const workspaceInvite = data?.workspace_for_invite_link

	const [getSsoLogin] = useGetSsoLoginLazyQuery()

	const handleAuth = useCallback(
		async ({ additionalUserInfo, user }: firebase.auth.UserCredential) => {
			const isNewUser = additionalUserInfo?.isNewUser && user?.email

			if (isNewUser) {
				analytics.track('Sign up', {
					email: user.email!,
					provider: additionalUserInfo.providerId,
				})

				if (!user?.emailVerified) {
					getAuth().currentUser?.sendEmailVerification()
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
			if (error === EXPECTED_REDIRECT) {
				return
			}

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
		setLoading(true)
		getAuth()
			.signInWithPopup(provider)
			.then(handleAuth)
			.catch(handleAuthError)
	}

	const handleEmailUpdate = useCallback(async () => {
		const email = formStore.getValue(formStore.names.email)
		if (!email) {
			return
		}

		// If we're not using firebase or oauth (simple, password), we need to require a password
		if (AUTH_MODE !== 'firebase' && AUTH_MODE !== 'oauth') {
			formStore.setValue('passwordRequired', true)
			return
		}

		const emailDomain = email.split('@')[1]
		const { data } = await getSsoLogin({
			variables: { domain: emailDomain },
		})
		const clientID = data?.sso_login?.client_id
		if (clientID) {
			formStore.setValue('passwordRequired', false)
			return clientID
		} else if (!formStore.getValue(formStore.names.password)) {
			formStore.setValue('passwordRequired', true)
			return
		}
	}, [formStore, getSsoLogin])

	formStore.useSubmit(async (formState) => {
		setLoading(true)

		const clientID = await handleEmailUpdate()
		if (clientID) {
			// temporary (short expiry), backend will set a longer expiry once login succeeds
			upsertCookie(Cookies.OAuthClientID, clientID, 5)
		} else if (!formState.values.password) {
			setLoading(false)
			return
		}

		await getAuth()
			.signInWithEmailAndPassword(
				formState.values.email,
				formState.values.password,
			)
			.then(handleAuth)
			.catch(handleAuthError)
	})

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
						{AUTH_MODE === 'firebase' ? (
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
			<AuthBody>
				<Stack gap="12">
					<Form.Input
						name={formStore.names.email}
						label="Email"
						type="email"
						autoFocus
						autoComplete="email"
						required
						onBlur={handleEmailUpdate}
					/>
					{passwordRequired ? (
						<>
							<Form.Input
								name={formStore.names.password}
								label="Password"
								type="password"
								autoComplete="current-password"
								required
							/>
							<Link to="/reset_password" state={{ email }}>
								<Text size="xSmall">Forgot your password?</Text>
							</Link>
						</>
					) : null}
					{error && <AuthError>{error}</AuthError>}
				</Stack>
			</AuthBody>

			<AuthFooter>
				<Stack gap="12">
					<Button
						trackingId="sign-up-submit"
						loading={loading}
						type="submit"
						id="email-password-signin"
					>
						Sign in
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
										getAuth().googleProvider!,
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
										getAuth().githubProvider!,
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
