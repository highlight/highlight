import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { VirtuosoHandle, Virtuoso } from 'react-virtuoso';
import { SessionCommentCard } from '../../../components/Comment/SessionComment/SessionComment';
import { useGetSessionCommentsQuery } from '../../../graph/generated/hooks';
import styles from './CommentStream.module.scss';

const CommentStream = () => {
    const { session_id } = useParams<{ session_id: string }>();
    const { data: sessionCommentsData, loading } = useGetSessionCommentsQuery({
        variables: {
            session_id: session_id,
        },
    });
    const virtuoso = useRef<VirtuosoHandle>(null);

    return (
        <div className={styles.commentStream}>
            {!loading && sessionCommentsData?.session_comments.length === 0 ? (
                <div className={styles.noCommentsContainer}>
                    <h2>There are no comments yet</h2>
                    <p>Click anywhere on the session player to leave one</p>
                </div>
            ) : (
                <Virtuoso
                    ref={virtuoso}
                    overscan={500}
                    data={sessionCommentsData?.session_comments}
                    itemContent={(index, comment: any) => (
                        <div
                            key={comment.id || index}
                            className={styles.comment}
                        >
                            <SessionCommentCard comment={comment} />
                        </div>
                    )}
                />
            )}
        </div>
    );
};

export default CommentStream;
