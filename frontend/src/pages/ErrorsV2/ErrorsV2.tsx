import { useAuthContext } from '@authentication/AuthContext'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { Skeleton } from '@components/Skeleton/Skeleton'
import {
	useGetErrorGroupQuery,
	useMuteErrorCommentThreadMutation,
} from '@graph/hooks'
import {
	Box,
	ButtonIcon,
	IconChevronDown,
	IconChevronUp,
	IconExitRight,
} from '@highlight-run/ui'
import { getHeaderFromError } from '@pages/Error/ErrorPage'
import ErrorBody from '@pages/ErrorsV2/ErrorBody/ErrorBody'
import ErrorInstance from '@pages/ErrorsV2/ErrorInstance/ErrorInstance'
import ErrorTitle from '@pages/ErrorsV2/ErrorTitle/ErrorTitle'
import NoActiveErrorCard from '@pages/ErrorsV2/NoActiveErrorCard/NoActiveErrorCard'
import SearchPanel from '@pages/ErrorsV2/SearchPanel/SearchPanel'
import { controlBar } from '@pages/ErrorsV2/SearchPanel/SearchPanel.css'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { IntegrationCard } from '@pages/Sessions/IntegrationCard/IntegrationCard'
import { useIntegrated } from '@util/integrated'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import clsx from 'clsx'
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

				<div
					className={clsx(styles.detailsContainer, {
						[styles.moveDetailsRight]: showLeftPanel,
					})}
				>
					{!integrated && <IntegrationCard />}

					<Box
						display="flex"
						flexDirection="column"
						style={{ height: '100%' }}
					>
						<Box
							display="flex"
							alignItems="center"
							px="12"
							borderBottom="neutral"
							cssClass={controlBar}
						>
							<Box display="flex" gap="8">
								{!showLeftPanel && (
									<ButtonIcon
										kind="secondary"
										size="small"
										shape="square"
										emphasis="medium"
										icon={<IconExitRight size={14} />}
										onClick={() => setShowLeftPanel(true)}
									/>
								)}
								<Box
									borderRadius="6"
									border="neutral"
									overflow="hidden"
									display="flex"
								>
									<ButtonIcon
										kind="secondary"
										size="small"
										shape="square"
										emphasis="low"
										icon={<IconChevronUp size={14} />}
										cssClass={styles.sessionSwitchButton}
									/>
									<Box as="span" borderRight="neutral" />
									<ButtonIcon
										kind="secondary"
										size="small"
										shape="square"
										emphasis="low"
										icon={<IconChevronDown size={14} />}
										cssClass={styles.sessionSwitchButton}
									/>
								</Box>
							</Box>
						</Box>
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
										<div>
											<ErrorTitle
												errorGroup={data?.error_group}
											/>

											<ErrorBody
												errorGroup={data?.error_group}
											/>

											<ErrorInstance
												errorGroup={data?.error_group}
											/>
										</div>
									)}
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
					</Box>
				</div>
			</div>
		</>
	)
}

export default ErrorsV2
