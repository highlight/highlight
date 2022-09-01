import Button from '@components/Button/Button/Button'
import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import Card from '@components/Card/Card'
import Dot from '@components/Dot/Dot'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetAdminQuery } from '@graph/hooks'
import { Landing } from '@pages/Landing/Landing'
import { auth } from '@util/auth'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'

import styles from './VerifyEmailCard.module.scss'

interface Props {
	onStartHandler: () => void
}

const VerifyEmailCard = ({ onStartHandler }: Props) => {
	const { setLoadingState } = useAppLoadingContext()
	const { data, stopPolling } = useGetAdminQuery({
		pollInterval: 500,
	})
	const [
		sendingVerificationEmailLoading,
		setSendingVerificationEmailLoading,
	] = useState(false)

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

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
		<Landing>
			<Card className={styles.card}>
				<h2>
					<span>
						{!isEmailVerified
							? 'Verifying Email'
							: 'Email Verified!'}
					</span>
					{!isEmailVerified && <Dot pulse className={styles.dot} />}
				</h2>

				{isEmailVerified && (
					<>
						<p>
							Awesome! You've verified your email. Let's get
							started now 😉
						</p>
						<ButtonLink
							className={styles.startButton}
							trackingId="VerifyEmailStart"
							to="/"
							onClick={onStartHandler}
						>
							Start Highlighting
						</ButtonLink>
					</>
				)}
				{!isEmailVerified && (
					<>
						<p>
							We sent you an email ({data?.admin?.email}) with a
							link to verify your email.
						</p>

						<div className={styles.actionsContainer}>
							<Button
								block
								trackingId="ResendVerificationEmail"
								type="primary"
								onClick={() => {
									setSendingVerificationEmailLoading(true)
									auth.currentUser
										?.sendEmailVerification()
										.then(() => {
											message.success(
												`Sent another email to ${data?.admin?.email}!`,
											)
											setSendingVerificationEmailLoading(
												false,
											)
										})
										.catch((_e) => {
											const e = _e as {
												code: string
											}
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
											setSendingVerificationEmailLoading(
												false,
											)
											message.error(msg)
										})
								}}
								loading={sendingVerificationEmailLoading}
							>
								Resend Email
							</Button>
						</div>
					</>
				)}
			</Card>
		</Landing>
	)
}

export default VerifyEmailCard
