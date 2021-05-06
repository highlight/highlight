import React from 'react';
import { ParsedSessionComment } from '../../../pages/Player/ReplayerContext';
import CommentTextBody from '../../../pages/Player/Toolbar/NewCommentEntry/CommentTextBody/CommentTextBody';
import SessionCommentHeader from './SessionCommentHeader';
import styles from './SessionComment.module.scss';
import classNames from 'classnames';

interface Props {
    comment: ParsedSessionComment;
    deepLinkedCommentId?: string | null;
    hasShadow?: boolean;
}

export const SessionCommentCard = ({
    comment,
    deepLinkedCommentId,
    hasShadow,
}: Props) => {
    return (
        <div
            className={classNames(styles.container, {
                [styles.deepLinkedComment]: deepLinkedCommentId === comment.id,
                [styles.hasShadow]: hasShadow,
            })}
        >
            <SessionComment
                comment={comment}
                deepLinkedCommentId={deepLinkedCommentId}
            />
        </div>
    );
};

export const SessionComment = ({ comment }: Props) => {
    return (
        <>
            <SessionCommentHeader key={comment.id} comment={comment} />
            <CommentTextBody commentText={comment.text} />
        </>
    );
};
