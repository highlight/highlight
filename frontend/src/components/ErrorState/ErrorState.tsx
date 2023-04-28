import { useAuthContext } from '@authentication/AuthContext'
import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import JoinWorkspace from '@components/ErrorState/JoinWorkspace/JoinWorkspace'
import Space from '@components/Space/Space'
import { Maybe } from '@graph/schemas'
import { Callout } from '@highlight-run/ui'
import clsx from 'clsx'
import { useState } from 'react'

import Button from '../Button/Button/Button'
import styles from './ErrorState.module.scss'
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
							<a href="/">
								<Button
									small
									type={
										joinableWorkspace || showRequestAccess
											? 'text'
											: 'primary'
									}
									trackingId="ErrorStateGoToMyAccount"
								>
									Go to My Account
								</Button>
							</a>
							{joinableWorkspace && (
								<JoinWorkspace workspace={joinableWorkspace} />
							)}
							{showRequestAccess && <RequestAccess />}
						</div>
					) : (
						<Space size="small">
							<ButtonLink
								type="primary"
								trackingId="ErrorStateSignIn"
								{...(isLoggedIn
									? { to: '/', href: undefined }
									: {
											to: undefined,
											href: '/',
											anchor: true,
									  })}
							>
								Sign in
							</ButtonLink>
							<ButtonLink
								trackingId="ErrorStateSignUp"
								type="default"
								{...(isLoggedIn
									? {
											to: {
												pathname: '/?sign_up=1',
											},
											href: undefined,
											state: {
												previousPathName:
													window.location.pathname,
											},
									  }
									: {
											to: undefined,
											href: '/?sign_up=1',
											anchor: true,
									  })}
							>
								Sign up
							</ButtonLink>
						</Space>
					)}
				</div>
			</Callout>
		</div>
	)
}
