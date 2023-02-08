import { Button } from '@components/Button'
import {
	Box,
	ButtonIcon,
	Form,
	IconSolidCheveronLeft,
	Stack,
	Text,
	useFormState,
	vars,
} from '@highlight-run/ui'
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import analytics from '@util/analytics'
import { auth } from '@util/auth'
import { validateEmail } from '@util/string'
import { message } from 'antd'
import React from 'react'
import { useHistory } from 'react-router-dom'

export const ResetPassword: React.FC = () => {
	const history = useHistory<{ previousPathName?: string }>()
	const [loading, setLoading] = React.useState(false)
	const formState = useFormState({
		defaultValues: {
			email: '',
		},
	})

	return (
		<Form
			state={formState}
			resetOnSubmit={false}
			onSubmit={() => {
				analytics.track('Reset password submission')

				if (!validateEmail(formState.values.email)) {
					message.warning('Please enter a valid email.')
					analytics.track('Reset password submission error')
					setLoading(false)
					return
				}

				setLoading(true)
				auth.sendPasswordResetEmail(formState.values.email)
					.catch(() => {
						// swallow error if user does not exist
						analytics.track('Reset password submission error')
						setLoading(false)
					})
					.finally(() => {
						message.success(
							'Password reset email sent (if a user exists)!',
						)

						setTimeout(() => {
							history.push('/sign_in')
						}, 1000)
					})
			}}
		>
			<AuthHeader px="10" py="4">
				<Stack justify="space-between" align="center" direction="row">
					<Box display="flex" style={{ width: 30 }}>
						<ButtonIcon
							kind="secondary"
							emphasis="low"
							size="xSmall"
							icon={
								<IconSolidCheveronLeft
									color={vars.theme.static.content.weak}
								/>
							}
							onClick={() => {
								history.push('/sign_in')
							}}
						/>
					</Box>
					<Text color="weak">Reset your password</Text>
					<Box style={{ width: 30 }}></Box>
				</Stack>
			</AuthHeader>
			<AuthBody>
				<Stack gap="12">
					<Form.Input
						name={formState.names.email}
						label="Email"
						type="email"
						autoFocus
					/>
				</Stack>
			</AuthBody>
			<AuthFooter>
				<Button
					trackingId="sign-up-submit"
					loading={loading}
					type="submit"
				>
					Reset password
				</Button>
			</AuthFooter>
		</Form>
	)
}
