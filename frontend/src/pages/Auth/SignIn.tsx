import { Button } from '@components/Button'
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
import analytics from '@util/analytics'
import { auth } from '@util/auth'
import firebase from 'firebase/app'
import React from 'react'
import { Link, useHistory } from 'react-router-dom'

type Props = {
	setResolver: React.Dispatch<
		React.SetStateAction<firebase.auth.MultiFactorResolver | undefined>
	>
}

export const SignIn: React.FC<Props> = ({ setResolver }) => {
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

				auth.signInWithEmailAndPassword(
					formState.values.email,
					formState.values.password,
				)
					.then(() => {})
					.catch((error) => {
						if (error.code == 'auth/multi-factor-auth-required') {
							setResolver(error.resolver)
							history.push('/multi_factor')
						} else {
							setError(error.toString())
						}

						analytics.track('Authentication error', {
							error: error.code,
						})
						setError(error.message || error.toString())
					})
					.finally(() => setLoading(false))
			}}
		>
			<AuthHeader>
				<Box mb="4">
					<Stack direction="column" gap="16" align="center">
						<SvgHighlightLogoOnLight height="48" width="48" />
						<Heading level="h4">Welcome back.</Heading>
						<Text>
							New here?{' '}
							<Link to="/sign_up">Create an account</Link>.
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
					<Link to="/reset_password">
						<Text size="xSmall">Forgot your password?</Text>
					</Link>
					{error && <AuthError>{error}</AuthError>}
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
						Sign in
					</Button>
					<Text color="weak" size="xSmall" align="center">
						or
					</Text>
					<Button
						kind="secondary"
						type="button"
						trackingId="sign-in-with-google"
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
						<Box display="flex" alignItems="center" gap="6">
							Sign in with Google <IconSolidSparkles />
						</Box>
					</Button>
				</Stack>
			</AuthFooter>
		</Form>
	)
}
