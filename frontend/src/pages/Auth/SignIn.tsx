import { Button } from '@components/Button'
import {
	useCreateAdminMutation,
	useGetWorkspaceForInviteLinkQuery,
} from '@graph/hooks'
import {
	Box,
	Form,
	Heading,
	IconSolidSparkles,
	Stack,
	Text,
	useFormState,
} from '@highlight-run/ui'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import { AuthBody, AuthError, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import useLocalStorage from '@rehooks/local-storage'
import { auth } from '@util/auth'
import firebase from 'firebase/compat/app'
import React, { useCallback, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { SIGN_UP_ROUTE } from '@/pages/Auth/AuthRouter'
import analytics from '@/util/analytics'

type Props = {
	setResolver: React.Dispatch<
		React.SetStateAction<firebase.auth.MultiFactorResolver | undefined>
	>
}

export const SignIn: React.FC<Props> = ({ setResolver }) => {
	const navigate = useNavigate()
	const { admin, signIn } = useAuthContext()
	const [inviteCode] = useLocalStorage('highlightInviteCode')
	const [loading, setLoading] = React.useState(false)
	const [error, setError] = React.useState('')
	const location = useLocation()
	const initialEmail: string = location.state?.email ?? ''
	const formState = useFormState({
		defaultValues: {
			email: initialEmail,
			password: '',
		},
	})
	const [createAdmin] = useCreateAdminMutation()
	const { data } = useGetWorkspaceForInviteLinkQuery({
		variables: {
			secret: inviteCode!,
		},
		skip: !inviteCode,
	})
	const workspaceInvite = data?.workspace_for_invite_link

	useEffect(() => {
		if (admin) {
			navigate('/')
		}
	}, [admin, navigate])

	const handleAuth = useCallback(
		async ({ additionalUserInfo, user }: firebase.auth.UserCredential) => {
			if (additionalUserInfo?.isNewUser && user?.email) {
				analytics.track('Sign up', {
					email: user.email,
					provider: additionalUserInfo.providerId,
				})

				await createAdmin()
			}

			signIn()
		},
		[createAdmin, signIn],
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

	if (auth.currentUser) {
		debugger
	}

	return (
		<Form
			state={formState}
			resetOnSubmit={false}
			onSubmit={() => {
				setLoading(true)

				auth.signInWithEmailAndPassword(
					formState.values.email,
					formState.values.password,
				)
					.then(handleAuth)
					.catch(handleAuthError)
			}}
		>
			<AuthHeader>
				<Box mb="4">
					<Stack direction="column" gap="16" align="center">
						<SvgHighlightLogoOnLight height="48" width="48" />
						<Heading level="h4">
							{workspaceInvite
								? `You're invited to join ‘${workspaceInvite.workspace_name}’`
								: 'Welcome back.'}
						</Heading>
						<Text>
							New here?{' '}
							<Link
								to={SIGN_UP_ROUTE}
								state={{ email: formState.values.email }}
							>
								Create an account
							</Link>
							.
						</Text>
					</Stack>
				</Box>
			</AuthHeader>
			<AuthBody>
				<Stack gap="12">
					<Form.Input
						name={formState.names.email}
						label="Email"
						type="email"
						autoFocus
						autoComplete="email"
					/>
					<Form.Input
						name={formState.names.password}
						label="Password"
						type="password"
						autoComplete="current-password"
					/>
					<Link
						to="/reset_password"
						state={{ email: formState.values.email }}
					>
						<Text size="xSmall">Forgot your password?</Text>
					</Link>
					{error && <AuthError>{error}</AuthError>}
				</Stack>
			</AuthBody>
			<AuthFooter>
				<Stack gap="12">
					<Button
						trackingId="sign-up-submit"
						loading={loading}
						type="submit"
					>
						Sign in
					</Button>
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
							auth.signInWithPopup(auth.googleProvider!)
								.then(handleAuth)
								.catch(handleAuthError)
						}}
					>
						<Box display="flex" alignItems="center" gap="6">
							Sign in with Google <IconSolidSparkles />
						</Box>
					</Button>
				</Stack>
			</AuthFooter>
		</Form>
	)
}
