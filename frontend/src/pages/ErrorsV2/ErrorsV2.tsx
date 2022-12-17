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
	Container,
	IconChevronDown,
	IconChevronUp,
	IconExitRight,
	vars,
} from '@highlight-run/ui'
import { getHeaderFromError } from '@pages/Error/ErrorPage'
import useErrorPageConfiguration from '@pages/Error/utils/ErrorPageUIConfiguration'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import ErrorBody from '@pages/ErrorsV2/ErrorBody/ErrorBody'
import ErrorTabContent from '@pages/ErrorsV2/ErrorTabContent/ErrorTabContent'
import ErrorTitle from '@pages/ErrorsV2/ErrorTitle/ErrorTitle'
import NoActiveErrorCard from '@pages/ErrorsV2/NoActiveErrorCard/NoActiveErrorCard'
import SearchPanel from '@pages/ErrorsV2/SearchPanel/SearchPanel'
import { controlBar } from '@pages/ErrorsV2/SearchPanel/SearchPanel.css'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { IntegrationCard } from '@pages/Sessions/IntegrationCard/IntegrationCard'
import analytics from '@util/analytics'
import { useIntegrated } from '@util/integrated'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import clsx from 'clsx'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useHotkeys } from 'react-hotkeys-hook'
import { useHistory } from 'react-router'

import styles from './ErrorsV2.module.scss'

const ErrorsV2: React.FC<React.PropsWithChildren> = () => {
	const { project_id, error_secure_id } = useParams<{
		project_id: string
		error_secure_id: string
	}>()
	const { isLoggedIn } = useAuthContext()
	const integrated = useIntegrated()
	const { searchResultSecureIds } = useErrorSearchContext()
	const { showLeftPanel, setShowLeftPanel } = useErrorPageConfiguration()

	const currentSearchResultIndex = searchResultSecureIds.findIndex(
		(secureId) => secureId === error_secure_id,
	)
	const canMoveForward =
		searchResultSecureIds.length &&
		currentSearchResultIndex < searchResultSecureIds.length - 1
	const canMoveBackward =
		searchResultSecureIds.length && currentSearchResultIndex > 0
	const nextSecureId = searchResultSecureIds[currentSearchResultIndex + 1]
	const previousSecureId = searchResultSecureIds[currentSearchResultIndex - 1]

	const {
		data,
		loading,
		error: errorQueryingErrorGroup,
	} = useGetErrorGroupQuery({
		variables: { secure_id: error_secure_id },
		skip: !error_secure_id,
		onCompleted: () => {
			analytics.track('Viewed error', { is_guest: !isLoggedIn })
		},
	})

	const history = useHistory()
	const goToErrorGroup = (secureId: string) => {
		history.push(
			`/${project_id}/errors/${secureId}${history.location.search}`,
		)
	}

	const isEmptyState =
		!error_secure_id && !errorQueryingErrorGroup && !loading

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

	useEffect(() => {
		if (!error_secure_id) {
			return
		}

		analytics.page({ is_guest: !isLoggedIn })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error_secure_id])

	useHotkeys(
		'j',
		() => {
			if (canMoveForward) {
				analytics.track('NextErrorGroupKeyboardShortcut')
				goToErrorGroup(nextSecureId)
			}
		},
		[canMoveForward, nextSecureId],
	)

	useHotkeys(
		'k',
		() => {
			if (canMoveBackward) {
				analytics.track('NextErrorGroupKeyboardShortcut')
				goToErrorGroup(previousSecureId)
			}
		},
		[canMoveBackward, previousSecureId],
	)

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
						cssClass={clsx({ [styles.emptyState]: isEmptyState })}
					>
						{isLoggedIn && (
							<Box
								backgroundColor="white"
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
											onClick={() =>
												setShowLeftPanel(true)
											}
										/>
									)}
									<Box
										borderRadius="6"
										overflow="hidden"
										display="flex"
										style={{
											// TODO: Replace with button group once built in UI package.
											boxShadow: `0 0 0 1px ${vars.color.neutral200} inset`,
										}}
									>
										<ButtonIcon
											kind="secondary"
											size="small"
											shape="square"
											emphasis="low"
											icon={<IconChevronUp size={14} />}
											cssClass={
												styles.sessionSwitchButton
											}
											onClick={() => {
												goToErrorGroup(previousSecureId)
											}}
											disabled={!canMoveBackward}
										/>
										<Box as="span" borderRight="neutral" />
										<ButtonIcon
											kind="secondary"
											size="small"
											shape="square"
											emphasis="low"
											icon={<IconChevronDown size={14} />}
											title="j"
											cssClass={
												styles.sessionSwitchButton
											}
											onClick={() => {
												goToErrorGroup(nextSecureId)
											}}
											disabled={!canMoveForward}
										/>
									</Box>
								</Box>
							</Box>
						)}
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
									<Container>
										{loading ? (
											<>
												<Skeleton
													count={1}
													style={{
														width: 940,
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
													errorGroup={
														data?.error_group
													}
												/>

												<ErrorBody
													errorGroup={
														data?.error_group
													}
												/>

												<ErrorTabContent
													errorGroup={
														data?.error_group
													}
												/>
											</div>
										)}
									</Container>
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
