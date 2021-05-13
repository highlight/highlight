import React, { ReactElement, useContext, useState } from 'react';

import { SessionComment } from '../../../../components/Comment/SessionComment/SessionComment';
import Popover from '../../../../components/Popover/Popover';
import ReplayerContext, { ParsedSessionComment } from '../../ReplayerContext';
import styles from '../Toolbar.module.scss';
import TimelineAnnotation from './TimelineAnnotation';

interface Props {
    comment: ParsedSessionComment;
}

function TimelineCommentAnnotation({ comment }: Props): ReactElement {
    const { pause, replayer } = useContext(ReplayerContext);

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
                    if (replayer) {
                        pause(comment.timestamp);
                    }
                }}
            />
        </Popover>
    );
}

export default TimelineCommentAnnotation;
