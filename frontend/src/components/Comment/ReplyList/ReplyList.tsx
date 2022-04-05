import { CommentHeader } from '@components/Comment/CommentHeader';
import { CommentReply, Maybe } from '@graph/schemas';
import CommentTextBody from '@pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody';
import React from 'react';

import styles from './ReplyList.module.scss';

interface ReplyListProps {
    replies: Maybe<CommentReply>[];
    errorComment?: boolean;
}

const ReplyList: React.FC<ReplyListProps> = ({ replies, errorComment }) => {
    return (
        <div className={styles.repliesList}>
            {replies.map((record) => {
                return (
                    record && (
                        <div className={styles.record} key={record.id}>
                            <div>
                                <CommentHeader
                                    comment={record}
                                    small={!errorComment}
                                >
                                    <CommentTextBody
                                        commentText={record.text}
                                    />
                                </CommentHeader>
                            </div>
                        </div>
                    )
                );
            })}
        </div>
    );
};

export default ReplyList;
