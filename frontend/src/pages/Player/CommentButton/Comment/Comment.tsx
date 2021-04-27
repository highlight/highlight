import classNames from 'classnames';
import React, { useState } from 'react';
import {
    Maybe,
    SanitizedAdmin,
    SessionComment,
} from '../../../../graph/generated/schemas';
import CommentPinIcon from '../../../../static/comment-pin.png';
import styles from './Comment.module.scss';
import commentButtonStyles from '../CommentButton.module.scss';
import CommentHeader from '../../Toolbar/TimelineAnnotation/CommentHeader';
import CommentTextBody from '../../Toolbar/NewCommentEntry/CommentTextBody/CommentTextBody';

interface Props {
    comment: Maybe<
        { __typename?: 'SessionComment' } & Pick<
            SessionComment,
            | 'id'
            | 'timestamp'
            | 'created_at'
            | 'updated_at'
            | 'text'
            | 'x_coordinate'
            | 'y_coordinate'
        > & {
                author: { __typename?: 'SanitizedAdmin' } & Pick<
                    SanitizedAdmin,
                    'id' | 'name' | 'email'
                >;
            }
    >;
    deepLinkedCommentId: string | null;
}

const Comment = ({ comment, deepLinkedCommentId }: Props) => {
    const [collapsed, setCollapsed] = useState(true);

    if (!comment) {
        return null;
    }

    return (
        <div
            key={comment.id}
            className={styles.comment}
            style={{
                left: `calc(${
                    comment.x_coordinate * 100
                }% - (var(--comment-indicator-width) / 2))`,
                top: `calc(${
                    comment.y_coordinate * 100
                }% - var(--comment-indicator-height) + 2px)`,
            }}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <button
                onClick={() => {
                    setCollapsed((previous) => !previous);
                }}
                className={classNames(
                    commentButtonStyles.commentIndicator,
                    styles.commentPinButton
                )}
            >
                <img src={CommentPinIcon} />
            </button>
            {!collapsed && (
                <div
                    className={classNames(styles.commentContainer, {
                        [styles.activeComment]:
                            deepLinkedCommentId === comment.id,
                    })}
                >
                    <CommentHeader key={comment.id} comment={comment} />
                    <CommentTextBody commentText={comment.text} />
                </div>
            )}
        </div>
    );
};

export default Comment;
