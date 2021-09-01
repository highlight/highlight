import { useAuthContext } from '@authentication/AuthContext';
import Alert from '@components/Alert/Alert';
import PersonalNotificationButton from '@components/Header/components/PersonalNotificationButton/PersonalNotificationButton';
import React, { useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import styles from './FullCommentList.module.scss';

interface Props {
    loading: boolean;
    comments?: any[];
    commentRender: (comment: any) => React.ReactNode;
    noCommentsMessage: string;
}

const FullCommentList = ({
    loading,
    comments = [],
    commentRender,
    noCommentsMessage,
}: Props) => {
    const virtuoso = useRef<VirtuosoHandle>(null);
    const { admin, isHighlightAdmin } = useAuthContext();

    return (
        <div className={styles.commentStream}>
            {loading && (
                <>
                    <Skeleton className={styles.skeleton} />
                </>
            )}
            {!loading && comments.length === 0 ? (
                <div className={styles.noCommentsContainer}>
                    <div className={styles.noCommentsTextContainer}>
                        <h2>There are no comments yet</h2>
                        <p>{noCommentsMessage}</p>
                    </div>
                    <PersonalNotificationButton />
                </div>
            ) : (
                <>
                    {!loading &&
                        !admin?.slack_im_channel_id &&
                        isHighlightAdmin && (
                            <Alert
                                trackingId={'PersonalNotificationCTA'}
                                message={'Get Comment Notifications'}
                                description={
                                    <>
                                        {
                                            'Get a slack DM anytime someone tags you in a Highlight comment!'
                                        }
                                        <PersonalNotificationButton
                                            text={'Enable Notifications'}
                                            style={{
                                                marginTop: 'var(--size-medium)',
                                            }}
                                        />
                                    </>
                                }
                                className={styles.comment}
                            />
                        )}
                    <Virtuoso
                        ref={virtuoso}
                        overscan={500}
                        data={comments}
                        itemContent={(index, comment: any) => (
                            <div
                                key={comment.id || index}
                                className={styles.comment}
                            >
                                {commentRender(comment)}
                            </div>
                        )}
                    />
                </>
            )}
        </div>
    );
};

export default FullCommentList;
