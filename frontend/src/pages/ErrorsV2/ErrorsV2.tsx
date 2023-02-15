import { useAuthContext } from '@authentication/AuthContext'
import { KeyboardShortcut } from '@components/KeyboardShortcut/KeyboardShortcut'
import LoadingBox from '@components/LoadingBox'
import { PreviousNextGroup } from '@components/PreviousNextGroup/PreviousNextGroup'
import {
	useGetErrorGroupQuery,
	useMarkErrorGroupAsViewedMutation,
	useMarkSessionAsViewedMutation,
	useMuteErrorCommentThreadMutation,
} from '@graph/hooks'
import {
	Box,
	ButtonIcon,
	Callout,
	Container,
	IconSolidExitRight,
	Text,
	Tooltip,
} from '@highlight-run/ui'
import useErrorPageConfiguration from '@pages/Error/utils/ErrorPageUIConfiguration'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { CompleteSetup } from '@pages/ErrorsV2/CompleteSetup/CompleteSetup'
import ErrorBody from '@pages/ErrorsV2/ErrorBody/ErrorBody'
import ErrorTabContent from '@pages/ErrorsV2/ErrorTabContent/ErrorTabContent'
import ErrorTitle from '@pages/ErrorsV2/ErrorTitle/ErrorTitle'
import NoActiveErrorCard from '@pages/ErrorsV2/NoActiveErrorCard/NoActiveErrorCard'
import SearchPanel from '@pages/ErrorsV2/SearchPanel/SearchPanel'
import { getHeaderFromError } from '@pages/ErrorsV2/utils'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import clsx from 'clsx'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router'
import { useLocation } from 'react-router-dom'

import * as styles from './styles.css'

const ErrorsV2: React.FC<React.PropsWithChildren<{ integrated: boolean }>> = ({
	integrated,
}) => {
	const { project_id, error_secure_id } = useParams<{
		project_id: string
		error_secure_id: string
	}>()
	const { isLoggedIn } = useAuthContext()
	const { searchResultSecureIds } = useErrorSearchContext()
	const { showLeftPanel, setShowLeftPanel } = useErrorPageConfiguration()
	const [markErrorGroupAsViewed] = useMarkErrorGroupAsViewedMutation()

	const currentSearchResultIndex = searchResultSecureIds.findIndex(
		(secureId) => secureId === error_secure_id,
	)
	const canMoveForward =
		!!searchResultSecureIds.length &&
		currentSearchResultIndex < searchResultSecureIds.length - 1
	const canMoveBackward =
		!!searchResultSecureIds.length && currentSearchResultIndex > 0
	const nextSecureId = searchResultSecureIds[currentSearchResultIndex + 1]
	const previousSecureId = searchResultSecureIds[currentSearchResultIndex - 1]

	const {
		data,
		loading,
		error: errorQueryingErrorGroup,
	} = useGetErrorGroupQuery({
		variables: { secure_id: error_secure_id! },
		skip: !error_secure_id,
		onCompleted: () => {
			if (error_secure_id) {
				markErrorGroupAsViewed({
					variables: {
						error_secure_id,
						viewed: true,
					},
				}).catch(console.error)
			}
			analytics.track('Viewed error', { is_guest: !isLoggedIn })
		},
	})

	const navigate = useNavigate()
	const location = useLocation()

	useEffect(() => {
		if (!isLoggedIn && !data?.error_group?.is_public) {
			navigate('/login', { replace: true })
		}
	}, [data?.error_group?.is_public, isLoggedIn, navigate])

	const goToErrorGroup = (secureId: string) => {
		navigate(`/${project_id}/errors/${secureId}${location.search}`, {
			replace: true,
		})
	}

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
				navigate(`${location.pathname}?${searchParams.toString()}`)

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
				analytics.track('PrevErrorGroupKeyboardShortcut')
				goToErrorGroup(previousSecureId)
			}
		},
		[canMoveBackward, previousSecureId],
	)

	useHotkeys(
		'cmd+b',
		() => {
			setShowLeftPanel(!showLeftPanel)
		},
		[showLeftPanel],
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
					<Box
						background="white"
						border="secondary"
						borderRadius="6"
						display="flex"
						flexDirection="column"
						height="full"
						shadow="small"
					>
						{isLoggedIn && (
							<Box
								display="flex"
								alignItems="center"
								borderBottom="secondary"
								p="6"
							>
								<Box display="flex" gap="8">
									{!showLeftPanel && (
										<Tooltip
											placement="bottom"
											trigger={
												<ButtonIcon
													kind="secondary"
													size="small"
													shape="square"
													emphasis="medium"
													icon={
														<IconSolidExitRight
															size={14}
														/>
													}
													onClick={() =>
														setShowLeftPanel(true)
													}
												/>
											}
										>
											<KeyboardShortcut
												label="Toggle sidebar"
												shortcut={['cmd', 'b']}
											/>
										</Tooltip>
									)}
									<PreviousNextGroup
										canMoveBackward={canMoveBackward}
										canMoveForward={canMoveForward}
										onPrev={() =>
											goToErrorGroup(previousSecureId)
										}
										onNext={() =>
											goToErrorGroup(nextSecureId)
										}
									/>
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
											<LoadingBox />
										) : (
											<Box pt="16" pb="32">
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
											</Box>
										)}
									</Container>
								</div>
							</>
						) : errorQueryingErrorGroup ? (
							<Box m="auto" style={{ maxWidth: 300 }}>
								<Callout kind="info" title="Can't load error">
									<Box pb="6">
										<Text>
											This error does not exist or has not
											been made public.
										</Text>
									</Box>
								</Callout>
							</Box>
						) : integrated ? (
							<NoActiveErrorCard />
						) : (
							<CompleteSetup />
						)}
					</Box>
				</div>
			</div>
		</>
	)
}

export default ErrorsV2
