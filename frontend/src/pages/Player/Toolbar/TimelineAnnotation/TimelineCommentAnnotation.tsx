import { SessionCommentType } from '@graph/schemas';
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils';
import { message } from 'antd';
import React, { ReactElement, useState } from 'react';

import { SessionComment } from '../../../../components/Comment/SessionComment/SessionComment';
import Popover from '../../../../components/Popover/Popover';
import { MillisToMinutesAndSeconds } from '../../../../util/time';
import {
    ParsedSessionComment,
    useReplayerContext,
} from '../../ReplayerContext';
import styles from '../Toolbar.module.scss';
import TimelineAnnotation from './TimelineAnnotation';
import timelineAnnotationStyles from './TimelineAnnotation.module.scss';

interface Props {
    comment: ParsedSessionComment;
}

function TimelineCommentAnnotation({ comment }: Props): ReactElement {
    const { pause, replayer } = useReplayerContext();
    const commentId = new URLSearchParams(location.search).get(
        PlayerSearchParameters.commentId
    );

    const [isTooltipOpen, setIsTooltipOpen] = useState(
        comment.type === SessionCommentType.Feedback && commentId === comment.id
    );

    return (
        <Popover
            key={comment.id}
            content={
                <div className={styles.popoverContent}>
                    <SessionComment comment={comment} />
                </div>
            }
            defaultVisible={isTooltipOpen}
            onVisibleChange={(visible) => {
                setIsTooltipOpen(visible);
            }}
            popoverClassName={timelineAnnotationStyles.popover}
        >
            <TimelineAnnotation
                isSelected={isTooltipOpen}
                event={comment}
                colorKey="Comments"
                onClickHandler={() => {
                    if (replayer && comment.timestamp != null) {
                        pause(comment.timestamp);
                        message.success(
                            `Changed player time to where comment was created at ${MillisToMinutesAndSeconds(
                                comment.timestamp
                            )}.`
                        );
                    }
                }}
            />
        </Popover>
    );
}

export default TimelineCommentAnnotation;
