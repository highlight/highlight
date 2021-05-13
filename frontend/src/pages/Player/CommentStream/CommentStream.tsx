import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { SessionCommentCard } from '../../../components/Comment/SessionComment/SessionComment';
import { useGetSessionCommentsQuery } from '../../../graph/generated/hooks';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { PlayerSearchParameters } from '../PlayerHook/utils';
import styles from './CommentStream.module.scss';

const CommentStream = () => {
    const { session_id } = useParams<{ session_id: string }>();
    const { data: sessionCommentsData, loading } = useGetSessionCommentsQuery({
        variables: {
            session_id: session_id,
        },
    });
    const virtuoso = useRef<VirtuosoHandle>(null);
    const [deepLinkedCommentId, setDeepLinkedCommentId] = useState(
        new URLSearchParams(location.search).get(
            PlayerSearchParameters.commentId
        )
    );

    useEffect(() => {
        const commentId = new URLSearchParams(location.search).get(
            PlayerSearchParameters.commentId
        );
        setDeepLinkedCommentId(commentId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

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
                            <SessionCommentCard
                                deepLinkedCommentId={deepLinkedCommentId}
                                comment={comment}
                                footer={
                                    <p className={styles.timestamp}>
                                        {MillisToMinutesAndSeconds(
                                            comment?.timestamp || 0
                                        )}
                                    </p>
                                }
                            />
                        </div>
                    )}
                />
            )}
        </div>
    );
};

export default CommentStream;
