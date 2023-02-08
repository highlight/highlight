import { Button } from '@components/Button'
import { useGetAdminQuery } from '@graph/hooks'
import { Stack, Text } from '@highlight-run/ui'
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import { auth } from '@util/auth'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'

export const VerifyEmail: React.FC = () => {
	const { data, stopPolling } = useGetAdminQuery({
		pollInterval: 500,
	})
	const [loading, setLoading] = useState(false)

	const isEmailVerified = data?.admin?.email_verified || false

	useEffect(() => {
		if (isEmailVerified) {
			stopPolling()
			window.location.reload()
		} else {
			// Show the Intercom message after 5 seconds in case the user needs help.
			setTimeout(() => {
				window.Intercom('update', {
					hide_default_launcher: false,
				})
			}, 1000 * 5)
		}
	}, [isEmailVerified, stopPolling])

	return (
		<>
			<AuthHeader>
				<Text>Verify your email</Text>
			</AuthHeader>
			<AuthBody>
				<Text>
					A link was sent to {data?.admin?.email}. Visit this link in
					order to continue.
				</Text>
			</AuthBody>
			<AuthFooter>
				<Stack gap="12">
					<Button
						trackingId="sign-up-submit"
						loading={loading}
						onClick={() => {
							setLoading(true)
							auth.currentUser
								?.sendEmailVerification()
								.then(() => {
									message.success(
										`Sent another email to ${data?.admin?.email}!`,
									)
								})
								.catch((e) => {
									let msg = ''

									switch (e.code) {
										case 'auth/too-many-requests':
											msg = `We've already sent another email recently. If you can't find it please try again later or reach out to us.`
											break

										default:
											msg =
												"There was a problem sending another email. Please try again. If you're still having trouble please reach out to us!"
											break
									}
									message.error(msg)
								})
								.finally(() => setLoading(false))
						}}
					>
						Resend Email
					</Button>
				</Stack>
			</AuthFooter>
		</>
	)
}
