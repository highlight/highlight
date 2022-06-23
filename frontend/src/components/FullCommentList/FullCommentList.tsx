import PersonalNotificationButton from '@components/Header/components/PersonalNotificationButton/PersonalNotificationButton';
import classNames from 'classnames';
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
                    <PersonalNotificationButton type="Organization" />
                </div>
            ) : (
                <>
                    <Virtuoso
                        ref={virtuoso}
                        overscan={500}
                        data={comments}
                        itemContent={(index, comment: any) => (
                            <div
                                key={comment.id || index}
                                className={classNames(styles.comment, {
                                    [styles.firstComment]: index === 0,
                                })}
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
