import React, { ReactElement, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Popover from '../../../../components/Popover/Popover';
import { PlayerSearchParameters } from '../../PlayerHook/utils';
import ReplayerContext, { ParsedSessionComment } from '../../ReplayerContext';
import styles from '../Toolbar.module.scss';
import TimelineAnnotation from './TimelineAnnotation';
import CommentHeader from './CommentHeader';
import CommentTextBody from '../NewCommentEntry/CommentTextBody/CommentTextBody';

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
                <div className={styles.popoverContent}>
                    <CommentTextBody commentText={comment.text} />
                </div>
            }
            onVisibleChange={(visible) => {
                setIsTooltipOpen(visible);
            }}
            title={<CommentHeader comment={comment} />}
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
