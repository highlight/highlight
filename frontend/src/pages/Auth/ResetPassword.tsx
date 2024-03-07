import { Button } from '@components/Button'
import {
	Box,
	ButtonIcon,
	Form,
	IconSolidCheveronLeft,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { SIGN_IN_ROUTE } from '@pages/Auth/AuthRouter'
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import analytics from '@util/analytics'
import { auth } from '@util/auth'
import { validateEmail } from '@util/string'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export const ResetPassword: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const initialEmail: string = location.state?.email ?? ''
	const [loading, setLoading] = useState(false)
	const formStore = Form.useStore({
		defaultValues: {
			email: initialEmail ?? '',
		},
	})
	const email = formStore.useValue('email')

	useEffect(() => analytics.page('Reset Password'), [])

	return (
		<Form
			store={formStore}
			resetOnSubmit={false}
			onSubmit={() => {
				analytics.track('Reset password submission')

				if (!validateEmail(email)) {
					message.warning('Please enter a valid email.')
					analytics.track('Reset password submission error')
					setLoading(false)
					return
				}

				setLoading(true)
				auth.sendPasswordResetEmail(email)
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
							navigate(SIGN_IN_ROUTE, {
								state: { email },
							})
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
								navigate(SIGN_IN_ROUTE, {
									state: {
										email,
									},
								})
							}}
						/>
					</Box>
					<Text color="moderate">Reset your password</Text>
					<Box style={{ width: 30 }}></Box>
				</Stack>
			</AuthHeader>
			<AuthBody>
				<Stack gap="12">
					<Form.Input
						name={formStore.names.email}
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
