import { Button } from '@components/Button'
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
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import analytics from '@util/analytics'
import { auth } from '@util/auth'
import firebase from 'firebase/app'
import React from 'react'
import { Link, useHistory } from 'react-router-dom'

export const SignUp: React.FC = () => {
	const history = useHistory<{ previousPathName?: string }>()
	const [loading, setLoading] = React.useState(false)
	const [error, setError] = React.useState('')
	const formState = useFormState({
		defaultValues: {
			email: '',
			password: '',
		},
	})

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
					.then(() => {
						auth.currentUser?.sendEmailVerification()

						// Redirect the user to their initial path instead to creating a new
						// workspace. We do this because this happens when a new user clicks
						// on a Highlight link that was shared to them and they don't have
						// an account yet.
						const redirect =
							history.location.state?.previousPathName ||
							'/verify_email'

						if (auth.currentUser?.email) {
							analytics.track('Sign up', {
								email: auth.currentUser.email,
								redirect,
							})
						}

						history.push(redirect)
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
						<Heading level="h4">Welcome to Highlight.</Heading>
						<Text>
							Have an account? <Link to="/sing_in">Sign in</Link>.
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
					/>
					<Form.Input
						name={formState.names.password}
						label="Password"
						type="password"
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
							auth.signInWithPopup(auth.googleProvider!).catch(
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
