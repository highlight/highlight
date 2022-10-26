import { useAuthContext } from '@authentication/AuthContext'
import { Avatar } from '@components/Avatar/Avatar'
import { GetRecentErrorsQuery } from '@graph/operations'
import { ErrorState } from '@graph/schemas'
import { useProjectId } from '@hooks/useProjectId'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

import ButtonLink from '../../../../../../components/Button/ButtonLink/ButtonLink'
import Card from '../../../../../../components/Card/Card'
import RelativeTime from '../../../../../../components/RelativeTime/RelativeTime'
import SvgPlaySolidIcon from '../../../../../../static/PlaySolidIcon'
import { ErrorStateSelect } from '../../../../ErrorStateSelect/ErrorStateSelect'
import styles from './ErrorAffectedUsers.module.scss'

interface Props {
	recentErrors?: GetRecentErrorsQuery
	loading: boolean
	state?: ErrorState
}

const ErrorAffectedUsers = ({ loading, state, recentErrors }: Props) => {
	const { isLoggedIn } = useAuthContext()
	const { projectId } = useProjectId()

	let numberOfAffectedSessions
	let mostRecentAffectedSession
	let uniqueUsers: string[] = []

	if (
		recentErrors?.error_group &&
		recentErrors.error_group.metadata_log.length
	) {
		numberOfAffectedSessions = recentErrors.error_group.metadata_log.length

		const mostRecentAffectedSessionIndex =
			recentErrors.error_group.metadata_log.reduce((acc, curr, index) => {
				const currentTimestamp = curr?.timestamp
				const recentTimestamp =
					recentErrors.error_group?.metadata_log[acc]?.timestamp

				if (
					currentTimestamp &&
					recentTimestamp &&
					currentTimestamp > recentTimestamp
				) {
					return index
				}
				return acc
			}, 0)

		mostRecentAffectedSession =
			recentErrors.error_group.metadata_log[
				mostRecentAffectedSessionIndex
			]

		uniqueUsers = new Array(
			...new Set(
				recentErrors.error_group.metadata_log.map(
					(session) =>
						(session?.identifier || session?.fingerprint) as string,
				),
			),
		)
	}

	const recentTimestamp = mostRecentAffectedSession?.timestamp

	return (
		<Card className={styles.card}>
			{loading || !recentErrors ? (
				<Skeleton style={{ height: 193 }} />
			) : (
				<>
					<div className={styles.metadata}>
						<div className={styles.avatarContainer}>
							{uniqueUsers
								?.slice(0, 3)
								.map((identifier, index) => (
									<Avatar
										key={index}
										style={{ left: `${index * 15}px` }}
										seed={identifier || ''}
										shape="rounded"
										className={styles.avatar}
									/>
								))}
						</div>
						<div className={styles.textContainer}>
							<h3>
								{uniqueUsers.length} Affected User
								{uniqueUsers.length === 1 ? '' : 's'}
							</h3>
							<p>
								{numberOfAffectedSessions} Total Session
								{numberOfAffectedSessions === 1 ? '' : 's'}
							</p>
							{recentTimestamp && (
								<p>
									Recency:{' '}
									{RelativeTime({
										datetime: recentTimestamp,
									})}
								</p>
							)}
						</div>
					</div>

					<div className={styles.actionsContainer}>
						<ButtonLink
							trackingId="ErrorMostRecentSession"
							to={`/${projectId}/sessions/${mostRecentAffectedSession?.session_secure_id}?${PlayerSearchParameters.errorId}=${mostRecentAffectedSession?.error_id}`}
							icon={
								<SvgPlaySolidIcon
									className={styles.playButton}
								/>
							}
							fullWidth
							className={styles.button}
							disabled={
								!isLoggedIn ||
								mostRecentAffectedSession === undefined
							}
						>
							Session
						</ButtonLink>
						<ErrorStateSelect state={state} loading={loading} />
					</div>
				</>
			)}
		</Card>
	)
}

export default ErrorAffectedUsers
