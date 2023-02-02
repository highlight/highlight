import { Button } from '@components/Button'
import {
	Box,
	ButtonIcon,
	Callout,
	Form,
	Heading,
	IconSolidGoogle,
	Stack,
	Text,
	useFormState,
} from '@highlight-run/ui'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import { Landing } from '@pages/Landing/Landing'
import analytics from '@util/analytics'
import { auth, googleProvider } from '@util/auth'
import firebase from 'firebase/app'
import React from 'react'
import { Link, useHistory } from 'react-router-dom'

import * as styles from './SignUp.css'

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
		<Landing>
			<Form
				className={styles.container}
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

							if (auth.currentUser?.email) {
								analytics.track('Sign up', {
									email: auth.currentUser.email,
								})
							}

							// Redirect the user to their initial path instead to creating a new
							// workspace. We do this because this happens when a new user clicks on
							// a Highlight link that was shared to them and they don't have an
							// account yet.
							if (history.location.state?.previousPathName) {
								history.push(
									history.location.state.previousPathName,
								)
							} else {
								history.push('/')
							}
						})
						.catch((error) => {
							setError(error.message || error.toString())
						})
						.finally(() => setLoading(false))
				}}
			>
				<Box
					backgroundColor="n2"
					borderBottom="dividerWeak"
					btr="8"
					p="12"
					pb="16"
					px="20"
					textAlign="center"
				>
					<Stack direction="column" gap="16" align="center">
						<SvgHighlightLogoOnLight height="48" width="48" />
						<Heading level="h4">Welcome to Highlight</Heading>
						<Text>
							Have an account? <Link to="/">Sign in</Link>.
						</Text>
					</Stack>
				</Box>
				<Box backgroundColor="default" py="16" px="20">
					<Stack gap="12">
						<Form.Input
							name={formState.names.email}
							label="Email"
							type="email"
							validate
							autoFocus
						/>
						<Form.Input
							name={formState.names.password}
							label="Password"
							type="password"
						/>
						{error && <Callout kind="error">{error}</Callout>}
					</Stack>
				</Box>
				<Box
					backgroundColor="n2"
					borderTop="dividerWeak"
					bbr="8"
					py="12"
					px="20"
					display="flex"
					flexDirection="column"
					gap="16"
				>
					<Stack gap="8">
						<Button
							onClick={() => null}
							trackingId="sign-up-submit"
							loading={loading}
							type="submit"
						>
							Sign up
						</Button>
						<Stack
							direction="row"
							align="center"
							justify="space-between"
						>
							<Text color="weak">Or sign up with</Text>
							<Stack direction="row" gap="6">
								<ButtonIcon
									kind="secondary"
									type="button"
									onClick={() => {
										auth.signInWithPopup(
											googleProvider,
										).catch(
											(
												error: firebase.auth.MultiFactorError,
											) => {
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
									icon={<IconSolidGoogle />}
								/>
							</Stack>
						</Stack>
					</Stack>
					<Text align="center" color="weak" size="xSmall">
						By creating an account you agree to our{' '}
						<a
							href="https://www.highlight.io/terms"
							target="_blank"
							rel="noreferrer"
						>
							Terms of Service
						</a>{' '}
						and{' '}
						<a
							href="https://www.highlight.io/privacy"
							target="_blank"
							rel="noreferrer"
						>
							Privacy Policy
						</a>
					</Text>
				</Box>
			</Form>
		</Landing>
	)
}
