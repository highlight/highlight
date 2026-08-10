import { useAuthContext } from '@authentication/AuthContext'
import JoinWorkspace from '@components/ErrorState/JoinWorkspace/JoinWorkspace'
import { LinkButton } from '@components/LinkButton'
import Space from '@components/Space/Space'
import { Maybe } from '@graph/schemas'
import { Callout } from '@highlight-run/ui/components'
import clsx from 'clsx'
import { useState } from 'react'

import { SIGN_IN_ROUTE, SIGN_UP_ROUTE } from '@/pages/Auth/AuthRouter'

import styles from './ErrorState.module.css'
import RequestAccess from './RequestAccess/RequestAccess'

export const ErrorState = ({
	message,
	errorString,
	joinableWorkspace,
	title = "Whoops, something's wrong!",
	shownWithHeader = false,
	showRequestAccess = false,
}: {
	message?: string
	errorString?: string
	joinableWorkspace?: Maybe<{ id: string; name: string }>
	title?: string
	shownWithHeader?: boolean
	showRequestAccess?: boolean
}) => {
	const { isLoggedIn } = useAuthContext()
	const [showError, setShowError] = useState(false)

	if (joinableWorkspace) {
		title = `Enter ${joinableWorkspace.name}?`
	}
	return (
		<div
			className={clsx(styles.errorWrapper, {
				[styles.shownWithHeader]: shownWithHeader,
			})}
		>
			<Callout kind="info" title={title}>
				<div>
					<p className={styles.errorBody}>
						{joinableWorkspace &&
							"Good news 🎉 Based on your email address, you're " +
								'already able to join this workspace! ' +
								'Join it to be able to view the session.'}
						{message}
					</p>
					{errorString !== undefined && (
						<details onToggle={() => setShowError((t) => !t)}>
							<summary className="cursor-pointer text-gray-500">
								{showError ? 'show less' : 'show more'}
							</summary>
							{showError && (
								<code className={styles.errorBody}>
									{errorString}
								</code>
							)}
						</details>
					)}
				</div>

				<div className={styles.buttonGroup}>
					{isLoggedIn ? (
						<div className={styles.loggedInButtonGroup}>
							<LinkButton
								size="small"
								to="/"
								kind={
									joinableWorkspace || showRequestAccess
										? 'secondary'
										: 'primary'
								}
								emphasis={
									joinableWorkspace || showRequestAccess
										? 'low'
										: 'high'
								}
								trackingId="Button-ErrorStateGoToMyAccount"
							>
								Go to My Account
							</LinkButton>
							{joinableWorkspace && (
								<JoinWorkspace workspace={joinableWorkspace} />
							)}
							{showRequestAccess && <RequestAccess />}
						</div>
					) : (
						<Space size="small">
							<LinkButton
								kind="primary"
								emphasis="high"
								trackingId="Link-ErrorStateSignIn"
								to={SIGN_IN_ROUTE}
								target="_blank"
							>
								Sign in
							</LinkButton>
							<LinkButton
								kind="secondary"
								emphasis="medium"
								trackingId="Link-ErrorStateSignUp"
								to={SIGN_UP_ROUTE}
								target="_blank"
							>
								Sign up
							</LinkButton>
						</Space>
					)}
				</div>
			</Callout>
		</div>
	)
}
