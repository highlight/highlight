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

interface Props {
    comment: ParsedSessionComment;
}

function TimelineCommentAnnotation({ comment }: Props): ReactElement {
    const { pause, replayer } = useReplayerContext();

    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    return (
        <Popover
            key={comment.id}
            content={
                <div className={styles.popoverContent}>
                    <SessionComment comment={comment} />
                </div>
            }
            onVisibleChange={(visible) => {
                setIsTooltipOpen(visible);
            }}
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
