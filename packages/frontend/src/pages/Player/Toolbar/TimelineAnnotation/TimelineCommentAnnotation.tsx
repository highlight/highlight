import { SessionComment } from '@components/Comment/SessionComment/SessionComment'
import { SessionCommentType } from '@graph/schemas'
import { getFullScreenPopoverGetPopupContainer } from '@pages/Player/context/PlayerUIContext'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import { message } from 'antd'
import React, { ReactElement, useState } from 'react'

import Popover from '../../../../components/Popover/Popover'
import { ParsedSessionComment, useReplayerContext } from '../../ReplayerContext'
import styles from '../Toolbar.module.scss'
import TimelineAnnotation, { getPopoverPlacement } from './TimelineAnnotation'
import timelineAnnotationStyles from './TimelineAnnotation.module.scss'

interface Props {
	comment: ParsedSessionComment
	relativeStartPercent: number
}

function TimelineCommentAnnotation({
	comment,
	relativeStartPercent,
}: Props): ReactElement {
	const { pause, replayer } = useReplayerContext()
	const commentId = new URLSearchParams(location.search).get(
		PlayerSearchParameters.commentId,
	)

	const [isTooltipOpen, setIsTooltipOpen] = useState(
		comment.type === SessionCommentType.Feedback &&
			commentId === comment.id,
	)

	const { offset, placement } = getPopoverPlacement(relativeStartPercent)
	return (
		<Popover
			align={{
				overflow: {
					adjustY: false,
					adjustX: false,
				},
				offset: offset,
			}}
			placement={placement}
			getPopupContainer={getFullScreenPopoverGetPopupContainer}
			key={comment.id}
			content={
				<div className={styles.popoverContent}>
					<SessionComment comment={comment} />
				</div>
			}
			defaultVisible={isTooltipOpen}
			onVisibleChange={(visible) => {
				setIsTooltipOpen(visible)
			}}
			popoverClassName={timelineAnnotationStyles.popover}
		>
			<TimelineAnnotation
				isSelected={isTooltipOpen}
				event={comment}
				colorKey="Comments"
				onClickHandler={() => {
					if (replayer && comment.timestamp != null) {
						pause(comment.timestamp)
						message.success(
							`Changed player time to where comment was created at ${MillisToMinutesAndSeconds(
								comment.timestamp,
							)}.`,
						)
					}
				}}
			/>
		</Popover>
	)
}

export default TimelineCommentAnnotation
