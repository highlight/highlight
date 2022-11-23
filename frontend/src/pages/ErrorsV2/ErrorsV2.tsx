import { useAuthContext } from '@authentication/AuthContext'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { Skeleton } from '@components/Skeleton/Skeleton'
import {
	useGetErrorGroupQuery,
	useMuteErrorCommentThreadMutation,
} from '@graph/hooks'
import { getHeaderFromError } from '@pages/Error/ErrorPage'
import ErrorBody from '@pages/ErrorsV2/ErrorBody/ErrorBody'
import ErrorTabContent from '@pages/ErrorsV2/ErrorTabContent/ErrorTabContent'
import ErrorTitle from '@pages/ErrorsV2/ErrorTitle/ErrorTitle'
import NoActiveErrorCard from '@pages/ErrorsV2/NoActiveErrorCard/NoActiveErrorCard'
import SearchPanel from '@pages/ErrorsV2/SearchPanel/SearchPanel'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { IntegrationCard } from '@pages/Sessions/IntegrationCard/IntegrationCard'
import { useIntegrated } from '@util/integrated'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { H } from 'highlight.run'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useHistory } from 'react-router'

import styles from './ErrorsV2.module.scss'

const ErrorsV2: React.FC<React.PropsWithChildren> = () => {
	const { error_secure_id } = useParams<{
		error_secure_id: string
	}>()
	const { isLoggedIn } = useAuthContext()
	const integrated = useIntegrated()

	const {
		data,
		loading,
		error: errorQueryingErrorGroup,
	} = useGetErrorGroupQuery({
		variables: { secure_id: error_secure_id },
		skip: !error_secure_id,
		onCompleted: () => {
			H.track('Viewed error', { is_guest: !isLoggedIn })
		},
	})

	const history = useHistory()

	const [muteErrorCommentThread] = useMuteErrorCommentThreadMutation()
	useEffect(() => {
		const urlParams = new URLSearchParams(location.search)

		const commentId = urlParams.get(PlayerSearchParameters.commentId)

		const hasMuted = urlParams.get(PlayerSearchParameters.muted) === '1'
		if (commentId && hasMuted) {
			muteErrorCommentThread({
				variables: {
					id: commentId,
					has_muted: hasMuted,
				},
			}).then(() => {
				const searchParams = new URLSearchParams(location.search)
				searchParams.delete(PlayerSearchParameters.muted)
				history.replace(
					`${history.location.pathname}?${searchParams.toString()}`,
				)

				message.success('Muted notifications for this comment thread.')
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.search])

	return (
		<>
			<Helmet>
				<title>Errors</title>
			</Helmet>

			<div className={styles.container}>
				<SearchPanel />

				<div className={styles.detailsContainer}>
					{!integrated && <IntegrationCard />}
					{error_secure_id && !errorQueryingErrorGroup ? (
						<>
							<Helmet>
								<title>
									Errors:{' '}
									{getHeaderFromError(
										data?.error_group?.event ?? [],
									)}
								</title>
							</Helmet>

							<div>
								<div className={styles.errorDetails}>
									{loading ? (
										<>
											<Skeleton
												count={1}
												style={{
													width: 300,
													height: 37,
												}}
											/>

											<Skeleton
												count={1}
												style={{
													height: '2ch',
													marginBottom: 0,
												}}
											/>
										</>
									) : (
										<>
											<ErrorTitle
												errorGroup={data?.error_group}
											/>

											<ErrorBody
												errorGroup={data?.error_group}
											/>

											<ErrorTabContent
												errorGroup={data?.error_group}
											/>
										</>
									)}
								</div>
							</div>
						</>
					) : errorQueryingErrorGroup ? (
						<ErrorState
							shownWithHeader
							message="This error does not exist or has not been made public."
						/>
					) : (
						<NoActiveErrorCard />
					)}
				</div>
			</div>
		</>
	)
}

export default ErrorsV2
