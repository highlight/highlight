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
import { auth } from '@util/auth'
import firebase from 'firebase/app'
import React, { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type Props = {
	setResolver: React.Dispatch<
		React.SetStateAction<firebase.auth.MultiFactorResolver | undefined>
	>
}

export const SignIn: React.FC<Props> = ({ setResolver }) => {
	const navigate = useNavigate()
	const [loading, setLoading] = React.useState(false)
	const [error, setError] = React.useState('')
	const formState = useFormState({
		defaultValues: {
			email: '',
			password: '',
		},
	})

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
		},
		[navigate, setResolver],
	)

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
					.catch(handleAuthError)
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
						autoComplete="current-password"
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
							auth.signInWithPopup(auth.googleProvider!).catch(
								handleAuthError,
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
