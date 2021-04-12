import classNames from 'classnames';
import moment from 'moment';
import React, { ReactElement, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Popover from '../../../../components/Popover/Popover';
import { PlayerSearchParameters } from '../../PlayerHook/utils';
import ReplayerContext, { ParsedSessionComment } from '../../ReplayerContext';
import styles from '../Toolbar.module.scss';
import TimelineAnnotation from './TimelineAnnotation';

interface Props {
    comment: ParsedSessionComment;
}

function TimelineCommentAnnotation({ comment }: Props): ReactElement {
    const location = useLocation();
    const commentId = new URLSearchParams(location.search).get(
        PlayerSearchParameters.commentId
    );
    const { pause, replayer } = useContext(ReplayerContext);

    const [isTooltipOpen, setIsTooltipOpen] = useState(false);

    return (
        <Popover
            key={comment.id}
            defaultVisible={commentId === comment.id}
            content={
                <div className={styles.popoverContent}>{comment.text}</div>
            }
            onVisibleChange={(visible) => {
                setIsTooltipOpen(visible);
            }}
            title={
                <div className={classNames(styles.commentHeader)}>
                    <span className={styles.commentAuthor}>
                        {comment.author.name || comment.author.email}
                    </span>
                    <span className={styles.commentUpdatedTime}>
                        {moment(comment.updated_at).fromNow()}
                    </span>
                </div>
            }
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
