import React, { useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import GoToButton from '../../../components/Button/GoToButton';
import { useGetSessionCommentsQuery } from '../../../graph/generated/hooks';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { PlayerSearchParameters } from '../PlayerHook/utils';
import ReplayerContext from '../ReplayerContext';
import CommentTextBody from '../Toolbar/NewCommentEntry/CommentTextBody/CommentTextBody';
import styles from './CommentStream.module.scss';

const CommentStream = () => {
    const { session_id } = useParams<{ session_id: string }>();
    const { data: sessionCommentsData } = useGetSessionCommentsQuery({
        variables: {
            session_id: session_id,
        },
    });
    const { pause } = useContext(ReplayerContext);
    const history = useHistory();

    return (
        <div className={styles.commentStream}>
            {sessionCommentsData?.session_comments.map((comment) => (
                <div key={comment?.id} className={styles.comment}>
                    <div className={styles.header}>
                        <h2>{comment?.author.name || comment?.author.email}</h2>
                        <p>
                            {MillisToMinutesAndSeconds(comment?.timestamp || 0)}
                        </p>
                    </div>
                    <CommentTextBody commentText={comment?.text || ''} />
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
            ))}
        </div>
    );
};

export default CommentStream;
