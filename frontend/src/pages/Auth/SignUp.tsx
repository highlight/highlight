import { Button } from '@components/Button'
import { useGetWorkspaceForInviteLinkQuery } from '@graph/hooks'
import {
	Box,
	Callout,
	Form,
	Heading,
	IconSolidSparkles,
	Stack,
	Text,
	useFormState,
} from '@highlight-run/ui'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import { SIGN_IN_ROUTE } from '@pages/Auth/AuthRouter'
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { auth } from '@util/auth'
import { message } from 'antd'
import firebase from 'firebase/app'
import React, { useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export const SignUp: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const [inviteCode] = useLocalStorage('highlightInviteCode')
	const [loading, setLoading] = React.useState(false)
	const [error, setError] = React.useState('')
	const formState = useFormState({
		defaultValues: {
			email: '',
			password: '',
		},
	})
	const { data, loading: loadingWorkspace } =
		useGetWorkspaceForInviteLinkQuery({
			variables: {
				secret: inviteCode!,
			},
			skip: !inviteCode,
			onCompleted: (data) => {
				if (data?.workspace_for_invite_link.invitee_email) {
					formState.setValue(
						'email',
						data?.workspace_for_invite_link.invitee_email,
					)
				}
			},
		})
	const workspaceInvite = data?.workspace_for_invite_link
	console.log('::: inviteCode', inviteCode, data, loadingWorkspace)

	const handleSubmit = useCallback(
		(credential: firebase.auth.UserCredential) => {
			message.success('Account created succesfully!')

			// Redirect the user to their initial path instead to creating a new
			// workspace. We do this because this happens when a new user clicks
			// on a Highlight link that was shared to them and they don't have
			// an account yet.
			const redirect = location.state?.previousPathName

			if (credential.user?.email) {
				analytics.track('Sign up', {
					email: credential.user.email,
					redirect,
				})
			}

			if (redirect) {
				navigate(redirect, { replace: true })
			}
		},
		[location.state?.previousPathName, navigate],
	)

	return (
		<Form
			state={formState}
			resetOnSubmit={false}
			onSubmit={() => {
				setLoading(true)

				auth.createUserWithEmailAndPassword(
					formState.values.email,
					formState.values.password,
				)
					.then(async (credential) => {
						auth.currentUser?.sendEmailVerification()
						handleSubmit(credential)
					})
					.catch((error) => {
						setError(error.message || error.toString())
						setLoading(false)
					})
			}}
		>
			<AuthHeader>
				<Box mb="4">
					<Stack direction="column" gap="16" align="center">
						<SvgHighlightLogoOnLight height="48" width="48" />
						<Heading level="h4">
							{workspaceInvite
								? `You're invited to join '${workspaceInvite.workspace_name}'`
								: 'Welcome to Highlight.'}
						</Heading>
						{/* TODO: If the user has an account, they should be signing in */}
						<Text>
							Have an account?{' '}
							<Link to={SIGN_IN_ROUTE}>Sign in</Link>.
						</Text>
					</Stack>
				</Box>
			</AuthHeader>
			<AuthBody>
				<Stack gap="12">
					<Form.Input
						name={formState.names.email}
						disabled={!!workspaceInvite?.invitee_email?.length}
						label="Email"
						type="email"
						autoFocus
						autoComplete="email"
					/>
					<Form.Input
						name={formState.names.password}
						label="Password"
						type="password"
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
							auth.signInWithPopup(auth.googleProvider!)
								.then(handleSubmit)
								.catch(
									(error: firebase.auth.MultiFactorError) => {
										let errorMessage = error.message

										if (
											error.code ===
											'auth/popup-closed-by-user'
										) {
											errorMessage =
												'Pop-up closed without successfully authenticating. Please try again.'
										}

										setError(errorMessage)
									},
								)
						}}
					>
						Sign up with Google <IconSolidSparkles />
					</Button>
				</Stack>
			</AuthFooter>
		</Form>
	)
}
