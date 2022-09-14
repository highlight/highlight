import { useAuthContext } from '@authentication/AuthContext'
import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import JoinWorkspace from '@components/ErrorState/JoinWorkspace/JoinWorkspace'
import Space from '@components/Space/Space'
import { Maybe } from '@graph/schemas'
import classNames from 'classnames'
import React, { useState } from 'react'

import Button from '../Button/Button/Button'
import ElevatedCard from '../ElevatedCard/ElevatedCard'
import styles from './ErrorState.module.scss'
import RequestAccess from './RequestAccess/RequestAccess'

export const ErrorState = ({
	message,
	errorString,
	joinableWorkspace,
	title = "Woops, something's wrong!",
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
			className={classNames(styles.errorWrapper, {
				[styles.shownWithHeader]: shownWithHeader,
			})}
		>
			<ElevatedCard title={title}>
				<p className={styles.errorBody}>
					{joinableWorkspace &&
						"Good news 🎉 Based on your email address, you're " +
							'already able to join this workspace! ' +
							'Join it to be able to view the session.'}
					{message}
					{errorString !== undefined && (
						<span
							className={styles.expandButton}
							onClick={() => setShowError((t) => !t)}
						>
							{showError ? 'show less' : 'show more'}
						</span>
					)}
				</p>
				{showError && (
					<code className={styles.errorBody}>{errorString}</code>
				)}
				<div className={styles.buttonGroup}>
					{isLoggedIn ? (
						<div className={styles.loggedInButtonGroup}>
							<a href="/">
								<Button
									type={
										joinableWorkspace || showRequestAccess
											? 'default'
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
												state: {
													previousPathName:
														window.location
															.pathname,
												},
											},
											href: undefined,
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
			</ElevatedCard>
		</div>
	)
}
