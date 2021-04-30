import React, { useContext, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { VirtuosoHandle, Virtuoso } from 'react-virtuoso';
import GoToButton from '../../../components/Button/GoToButton';
import { useGetSessionCommentsQuery } from '../../../graph/generated/hooks';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { PlayerSearchParameters } from '../PlayerHook/utils';
import ReplayerContext from '../ReplayerContext';
import CommentTextBody from '../Toolbar/NewCommentEntry/CommentTextBody/CommentTextBody';
import styles from './CommentStream.module.scss';

const CommentStream = () => {
    const { session_id } = useParams<{ session_id: string }>();
    const { data: sessionCommentsData, loading } = useGetSessionCommentsQuery({
        variables: {
            session_id: session_id,
        },
    });
    const { pause } = useContext(ReplayerContext);
    const history = useHistory();
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
                    itemContent={(_index, comment: any) => (
                        <div key={comment?.id} className={styles.comment}>
                            <div className={styles.header}>
                                <h2>
                                    {comment?.author.name ||
                                        comment?.author.email}
                                </h2>
                                <p>
                                    {MillisToMinutesAndSeconds(
                                        comment?.timestamp || 0
                                    )}
                                </p>
                            </div>
                            <CommentTextBody
                                commentText={comment?.text || ''}
                            />
                            <GoToButton
                                className={styles.goToButton}
                                onClick={() => {
                                    if (comment?.id) {
                                        const urlSearchParams = new URLSearchParams();
                                        urlSearchParams.append(
                                            PlayerSearchParameters.commentId,
                                            comment?.id
                                        );

                                        console.log(history.location.pathname);
                                        history.replace(
                                            `${
                                                history.location.pathname
                                            }?${urlSearchParams.toString()}`
                                        );
                                        pause(comment?.timestamp);
                                    }
                                }}
                            />
                        </div>
                    )}
                />
            )}
        </div>
    );
};

export default CommentStream;
