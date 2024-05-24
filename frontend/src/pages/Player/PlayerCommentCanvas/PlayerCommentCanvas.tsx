import { toast } from '@components/Toaster'
import {
	useGetSessionCommentsQuery,
	useMuteSessionCommentThreadMutation,
} from '@graph/hooks'
import { Box } from '@highlight-run/ui/components'
import PlayerSessionComment from '@pages/Player/PlayerCommentCanvas/PlayerSessionComment/PlayerSessionComment'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { CommentIndicator } from '@/components/Comment/CommentIndicator'
import { useSessionParams } from '@/pages/Sessions/utils'

import styles from './PlayerCommentCanvas.module.css'

export interface Coordinates2D {
	x: number
	y: number
}
interface Props {
	setModalPosition: React.Dispatch<
		React.SetStateAction<Coordinates2D | undefined>
	>
	modalPosition: Coordinates2D | undefined
	setCommentPosition: React.Dispatch<
		React.SetStateAction<Coordinates2D | undefined>
	>
}

const PlayerCommentCanvas = ({
	setModalPosition,
	modalPosition,
	setCommentPosition,
}: Props) => {
	const { admin } = useAuthContext()
	const { sessionSecureId } = useSessionParams()
	const { data: sessionCommentsData } = useGetSessionCommentsQuery({
		variables: {
			session_secure_id: sessionSecureId!,
		},
	})
	const {
		selectedTimelineAnnotationTypes,
		setSelectedTimelineAnnotationTypes,
		enableInspectElement,
	} = usePlayerConfiguration()

	const { isPlayerReady, pause, replayer } = useReplayerContext()

	const location = useLocation()
	const navigate = useNavigate()

	const buttonRef = useRef<HTMLButtonElement>(null)
	const [indicatorLocation, setIndicatorLocation] = useState<
		Coordinates2D | undefined
	>(undefined)

	const [muteSessionCommentThread] = useMuteSessionCommentThreadMutation()

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search)
		const commentId = searchParams.get(PlayerSearchParameters.commentId)

		if (commentId) {
			// Show comments on the timeline indicators if deep linked.
			if (!selectedTimelineAnnotationTypes.includes('Comments')) {
				setSelectedTimelineAnnotationTypes([
					...selectedTimelineAnnotationTypes,
					'Comments',
				])
			}
		}
		const hasMuted = searchParams.get(PlayerSearchParameters.muted) === '1'

		if (commentId && hasMuted) {
			muteSessionCommentThread({
				variables: {
					id: commentId,
					has_muted: hasMuted,
				},
			}).then(() => {
				searchParams.delete(PlayerSearchParameters.muted)
				navigate(`${location.pathname}?${searchParams.toString()}`, {
					replace: true,
				})

				toast.success('Muted notifications for the comment thread.')
			})
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.search])

	// Set size of the button to be the same as the replayer. This allows us to intercept any clicks on replayer.
	const width = replayer?.wrapper.getBoundingClientRect().width
	const height = replayer?.wrapper.getBoundingClientRect().height
	useEffect(() => {
		if (!width || !height) {
			return
		}

		if (buttonRef.current) {
			buttonRef.current.style.width = `${width}px`
			buttonRef.current.style.height = `${height}px`
		}
	}, [enableInspectElement, height, width])

	// Hide the indicator if there is no comment being created.
	useEffect(() => {
		if (!modalPosition) {
			setIndicatorLocation(undefined)
			setCommentPosition(undefined)
		}
	}, [modalPosition, setCommentPosition])

	const showCommentsOverlaid =
		selectedTimelineAnnotationTypes.includes('Comments')

	if (!isPlayerReady || enableInspectElement) {
		return null
	}
	return (
		<button
			className={clsx({
				[styles.commentButton]: isPlayerReady,
			})}
			onClick={(e) => {
				if (buttonRef?.current) {
					const rect = buttonRef.current.getBoundingClientRect()

					// Calculate the position of where the user clicked relative to the session player.
					const x = e.clientX - rect.left
					const y = e.clientY - rect.top
					// Calculate relative percentage. We will store this and use it to position overlaid comments. We store the relative percentage instead of the absolute value to account for different users viewing the session at different scales/sizes.
					const xPercentage = x / rect.width
					const yPercentage = y / rect.height

					const xOffset = 34
					let yOffset = -60

					if (yPercentage > 0.9) {
						yOffset -= 100
					}
					setModalPosition({
						x: e.pageX + xOffset,
						y: e.pageY + yOffset,
					})
					setIndicatorLocation({ x, y })
					setCommentPosition({
						x: xPercentage,
						y: yPercentage,
					})
					pause()
				}
			}}
			ref={buttonRef}
		>
			{indicatorLocation && (
				<Box
					cssClass={styles.commentIndicator}
					position="absolute"
					style={{
						left: `calc(${indicatorLocation.x}px - 10px)`,
						top: `calc(${indicatorLocation.y}px - var(--comment-indicator-width))`,
					}}
				>
					<CommentIndicator
						seed={admin?.name ?? admin?.email ?? 'Anonymous'}
						customImage={admin?.photo_url}
					/>
				</Box>
			)}
			{sessionCommentsData?.session_comments.map(
				(comment) =>
					comment &&
					showCommentsOverlaid && (
						<PlayerSessionComment
							key={comment.id}
							comment={comment}
						/>
					),
			)}
			{/* needed because the backdrop-filter doesn't take effect if this button has no children */}
			&nbsp;
		</button>
	)
}

export default PlayerCommentCanvas
