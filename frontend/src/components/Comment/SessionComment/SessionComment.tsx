import React from 'react';
import { ParsedSessionComment } from '../../../pages/Player/ReplayerContext';
import CommentTextBody from '../../../pages/Player/Toolbar/NewCommentEntry/CommentTextBody/CommentTextBody';
import SessionCommentHeader from './SessionCommentHeader';
import styles from './SessionComment.module.scss';
import classNames from 'classnames';

interface Props {
    comment: ParsedSessionComment;
    deepLinkedCommentId?: string | null;
}

export const SessionCommentCard = ({ comment, deepLinkedCommentId }: Props) => {
    return (
        <div
            className={classNames(styles.container, {
                [styles.deepLinkedComment]: deepLinkedCommentId === comment.id,
            })}
        >
            <SessionComment
                comment={comment}
                deepLinkedCommentId={deepLinkedCommentId}
            />
        </div>
    );
};

export const SessionComment = ({ comment, deepLinkedCommentId }: Props) => {
    return (
        <>
            <SessionCommentHeader key={comment.id} comment={comment} />
            <CommentTextBody commentText={comment.text} />
        </>
    );
};
