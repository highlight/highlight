import classNames from 'classnames';
import React from 'react';

import { ParsedSessionComment } from '../../../pages/Player/ReplayerContext';
import CommentTextBody from '../../../pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody';
import styles from './SessionComment.module.scss';
import SessionCommentHeader, {
    CommentHeaderMenuItem,
} from './SessionCommentHeader';

interface Props {
    comment: ParsedSessionComment;
    deepLinkedCommentId?: string | null;
    hasShadow?: boolean;
    menuItems?: CommentHeaderMenuItem[];
    footer?: React.ReactNode;
}

export const SessionCommentCard = ({
    comment,
    deepLinkedCommentId,
    hasShadow,
    menuItems,
    footer,
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
                menuItems={menuItems}
                footer={footer}
            />
        </div>
    );
};

export const SessionComment = ({ comment, menuItems, footer }: Props) => {
    return (
        <>
            <SessionCommentHeader
                key={comment.id}
                comment={comment}
                menuItems={menuItems}
                footer={footer}
            >
                <CommentTextBody commentText={comment.text} />
            </SessionCommentHeader>
        </>
    );
};
