import { useParams } from '@util/react-router/useParams';
import React, { useEffect, useState } from 'react';

import { SessionCommentCard } from '../../../components/Comment/SessionComment/SessionComment';
import FullCommentList from '../../../components/FullCommentList/FullCommentList';
import { useGetSessionCommentsQuery } from '../../../graph/generated/hooks';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { PlayerSearchParameters } from '../PlayerHook/utils';
import styles from './SessionFullCommentList.module.scss';

const SessionFullCommentList = () => {
    const { session_id } = useParams<{ session_id: string }>();
    const { data: sessionCommentsData, loading } = useGetSessionCommentsQuery({
        variables: {
            session_id: session_id,
        },
    });
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
        <FullCommentList
            loading={loading}
            comments={sessionCommentsData?.session_comments}
            commentRender={(comment) => (
                <SessionCommentCard
                    deepLinkedCommentId={deepLinkedCommentId}
                    comment={comment}
                    footer={
                        <p className={styles.timestamp}>
                            {MillisToMinutesAndSeconds(comment?.timestamp || 0)}
                        </p>
                    }
                />
            )}
            noCommentsMessage="Click anywhere on the session player to leave one"
        />
    );
};

export default SessionFullCommentList;
