import classNames from 'classnames';
import React, { useContext } from 'react';
import {
    Maybe,
    SanitizedAdmin,
    SessionComment as SessionCommentType,
} from '../../../../graph/generated/schemas';
import CommentPinIcon from '../../../../static/comment-pin.png';
import styles from './PlayerSessionComment.module.scss';
import commentButtonStyles from '../PlayerCommentCanvas.module.scss';
import ReplayerContext from '../../ReplayerContext';
import TransparentPopover from '../../../../components/Popover/TransparentPopover';
import { SessionCommentCard } from '../../../../components/Comment/SessionComment/SessionComment';

interface Props {
    comment: Maybe<
        { __typename?: 'SessionComment' } & Pick<
            SessionCommentType,
            | 'id'
            | 'timestamp'
            | 'created_at'
            | 'session_id'
            | 'updated_at'
            | 'text'
            | 'x_coordinate'
            | 'y_coordinate'
        > & {
                author: { __typename?: 'SanitizedAdmin' } & Pick<
                    SanitizedAdmin,
                    'id' | 'name' | 'email' | 'photo_url'
                >;
            }
    >;
    deepLinkedCommentId: string | null;
}

/**
 * A comment that is rendered onto the Player relative to where the comment was made.
 */
const PlayerSessionComment = ({ comment, deepLinkedCommentId }: Props) => {
    const { pause } = useContext(ReplayerContext);

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
            <TransparentPopover
                placement="right"
                visible
                content={
                    <div className={styles.sessionCommentCardContainer}>
                        <SessionCommentCard
                            comment={comment}
                            deepLinkedCommentId={deepLinkedCommentId}
                            hasShadow
                        />
                    </div>
                }
                align={{ offset: [0, 12] }}
                defaultVisible={deepLinkedCommentId === comment.id}
            >
                <button
                    onClick={() => {
                        pause(comment.timestamp);
                    }}
                    className={classNames(
                        commentButtonStyles.commentIndicator,
                        styles.commentPinButton
                    )}
                >
                    <img src={CommentPinIcon} />
                </button>
            </TransparentPopover>
        </div>
    );
};

export default PlayerSessionComment;
