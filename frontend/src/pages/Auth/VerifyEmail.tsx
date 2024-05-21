import { Button } from '@components/Button'
import { toast } from '@components/Toaster'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetAdminQuery } from '@graph/hooks'
import { Box, Stack, Text } from '@highlight-run/ui/components'
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import { Landing } from '@pages/Landing/Landing'
import { auth } from '@util/auth'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ABOUT_YOU_ROUTE } from '@/routers/AppRouter/AppRouter'

import * as styles from './AuthRouter.css'

export const VerifyEmail: React.FC = () => {
	const { setLoadingState } = useAppLoadingContext()
	// Want to use pollInterval but it is not working in React v18. More info:
	// https://github.com/apollographql/apollo-client/issues/9819
	const { data, startPolling, stopPolling } = useGetAdminQuery({
		nextFetchPolicy: 'network-only',
	})
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const isEmailVerified = !!data?.admin?.email_verified

	useEffect(() => {
		if (isEmailVerified) {
			stopPolling()
			navigate(ABOUT_YOU_ROUTE)
		} else {
			startPolling(1000)
		}
	}, [isEmailVerified, navigate, startPolling, stopPolling])

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	return (
		<Landing>
			<Box cssClass={styles.container}>
				<AuthHeader>
					<Text color="moderate">Verify your email</Text>
				</AuthHeader>
				<AuthBody>
					<Text align="center" break="word">
						A link was sent to {auth.currentUser?.email}. Visit this
						link in order to continue.
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
										toast.success(
											`Sent another email to ${auth.currentUser?.email}!`,
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
										toast.error(msg)
									})
									.finally(() => setLoading(false))
							}}
						>
							Resend Email
						</Button>
					</Stack>
				</AuthFooter>
			</Box>
		</Landing>
	)
}
