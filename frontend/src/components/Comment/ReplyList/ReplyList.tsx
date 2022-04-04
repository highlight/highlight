import { CommentHeader } from '@components/Comment/CommentHeader';
import { CommentReply, Maybe } from '@graph/schemas';
import CommentTextBody from '@pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody';
import React from 'react';

import styles from './ReplyList.module.scss';

interface ReplyListProps {
    replies: Maybe<CommentReply>[];
}

const ReplyList: React.FC<ReplyListProps> = ({ replies }) => {
    return (
        <div className={styles.repliesList}>
            {replies.map((record) => {
                return (
                    record && (
                        <div className={styles.record} key={record.id}>
                            <div>
                                <CommentHeader comment={record}>
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
