import { Button } from '@components/Button'
import {
	Box,
	ButtonIcon,
	Form,
	Heading,
	IconSolidGithub,
	Stack,
	Text,
	useFormState,
} from '@highlight-run/ui'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import { Landing } from '@pages/Landing/Landing'
import analytics from '@util/analytics'
import { auth } from '@util/auth'
import React from 'react'
import { Link, useHistory } from 'react-router-dom'

import { ReactComponent as GoogleLogo } from '../../static/google.svg'
import * as styles from './SignUp.css'

type Props = React.PropsWithChildren & {}

export const SignUp: React.FC<Props> = (props) => {
	const history = useHistory<{ previousPathName?: string }>()
	const [loading, setLoading] = React.useState(false)
	const formState = useFormState({
		defaultValues: {
			name: '',
			email: '',
			password: '',
		},
	})

	const handleSubmit = () => {
		console.log(formState)
		debugger
		auth.createUserWithEmailAndPassword(formState.email, formState.password)
			.then(() => {
				auth.currentUser?.sendEmailVerification()

				if (auth.currentUser?.email) {
					analytics.track('Sign up', {
						email: auth.currentUser.email,
					})
				}
			})
			.catch((error) => {
				// setError(error.toString())
			})
			.finally(() => setLoading(false))

		// Redirect the user to their initial path instead to creating a new workspace.
		// We do this because this happens when a new user clicks on a Highlight link that was shared to them and they don't have an account yet.
		if (history.location.state?.previousPathName) {
			history.push(history.location.state.previousPathName)
		}
	}

	return (
		<Landing>
			<Form
				className={styles.container}
				state={formState}
				onSubmit={handleSubmit}
			>
				<Box
					backgroundColor="n2"
					btr="8"
					p="12"
					pb="16"
					px="20"
					textAlign="center"
					borderBottom="divider"
				>
					<Stack direction="column" gap="16" align="center">
						<SvgHighlightLogoOnLight height="48" width="48" />
						<Heading level="h4">Welcome to Highlight</Heading>
						<Text>
							Have an account? <Link to="/">Sign in</Link>.
						</Text>
					</Stack>
				</Box>
				<Box backgroundColor="default" py="12" px="20">
					<Stack gap="12">
						<Form.Input
							name={formState.names.name}
							label="Your full name"
						/>
						<Form.Input
							name={formState.names.email}
							label="Email"
						/>
						<Form.Input
							name={formState.names.password}
							label="Password"
							type="password"
						/>
					</Stack>
				</Box>
				<Box
					backgroundColor="n2"
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
						>
							Continue
						</Button>
						<Stack
							direction="row"
							align="center"
							justify="space-between"
						>
							<Text color="weak">Or sign up with</Text>
							<ButtonIcon
								kind="secondary"
								icon={<GoogleLogo />}
							/>
							<ButtonIcon
								kind="secondary"
								icon={<IconSolidGithub />}
							/>
						</Stack>
					</Stack>
					<Text align="center" color="weak" size="xSmall">
						By creating an account you agree to our{' '}
						<a href="">Terms of Service</a>
						and <a href="">Privacy Policy</a>
					</Text>
				</Box>
			</Form>
		</Landing>
	)
}
