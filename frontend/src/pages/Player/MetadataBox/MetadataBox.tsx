import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import React from 'react';
import {
    FaExternalLinkSquareAlt,
    FaFacebookSquare,
    FaGithubSquare,
    FaLinkedin,
} from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';

import { useAuthContext } from '../../../authentication/AuthContext';
import { Avatar } from '../../../components/Avatar/Avatar';
import UserIdentifier from '../../../components/UserIdentifier/UserIdentifier';
import {
    useGetSocialLinksQuery,
    useMarkSessionAsStarredMutation,
} from '../../../graph/generated/hooks';
import { Maybe, Session } from '../../../graph/generated/schemas';
import { ReactComponent as StarIcon } from '../../../static/star.svg';
import { ReactComponent as FilledStarIcon } from '../../../static/star-filled.svg';
import { getIdentifiedUserProfileImage } from '../../Sessions/SessionsFeedV2/components/MinimalSessionCard/utils/utils';
import { useReplayerContext } from '../ReplayerContext';
import styles from './MetadataBox.module.scss';
import { getMajorVersion } from './utils/utils';

export const MetadataBox = () => {
    const { isLoggedIn } = useAuthContext();
    const { session_secure_id } = useParams<{ session_secure_id: string }>();
    const { session } = useReplayerContext();
    const { loading, data } = useGetSocialLinksQuery({
        variables: { session_secure_id },
    });

    const [markSessionAsStarred] = useMarkSessionAsStarredMutation({
        update(cache) {
            cache.modify({
                fields: {
                    session(existingSession) {
                        const updatedSession = {
                            ...existingSession,
                            starred: !existingSession.starred,
                        };
                        return updatedSession;
                    },
                },
            });
        },
    });
    const created = new Date(session?.created_at ?? 0);
    const customAvatarImage = getIdentifiedUserProfileImage(
        session as Maybe<Session>
    );

    return (
        <div className={styles.userBox}>
            <>
                {isLoggedIn && (
                    <div
                        className={styles.starIconWrapper}
                        onClick={() => {
                            markSessionAsStarred({
                                variables: {
                                    secure_id: session_secure_id,
                                    starred: !session?.starred,
                                },
                            })
                                .then(() => {
                                    message.success(
                                        'Updated session status!',
                                        3
                                    );
                                })
                                .catch(() => {
                                    message.error(
                                        'Error updating session status!',
                                        3
                                    );
                                });
                        }}
                    >
                        {session?.starred ? (
                            <FilledStarIcon className={styles.starredIcon} />
                        ) : (
                            <StarIcon className={styles.unstarredIcon} />
                        )}
                    </div>
                )}
                <div className={styles.userAvatarWrapper}>
                    {!session ? (
                        <Skeleton circle={true} height={36} width={36} />
                    ) : (
                        <Avatar
                            style={{ width: '36px', height: '36px' }}
                            seed={session?.identifier ?? ''}
                            shape="rounded"
                            customImage={customAvatarImage}
                        />
                    )}
                </div>
                <div className={styles.headerWrapper}>
                    {!session ? (
                        <Skeleton
                            count={3}
                            style={{ height: 20, marginBottom: 5 }}
                        />
                    ) : (
                        <>
                            <h4 className={styles.userIdHeader}>
                                <UserIdentifier
                                    session={session}
                                    className={styles.userIdentifier}
                                />
                            </h4>
                            <p className={styles.userIdSubHeader}>
                                {created.toLocaleString('en-us', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    weekday: 'long',
                                })}
                            </p>
                            <p className={styles.userIdSubHeader}>
                                {created.toLocaleString('en-us', {
                                    second: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZoneName: 'short',
                                })}
                            </p>
                            <p className={styles.userIdSubHeader}>
                                {session?.browser_name && (
                                    <>
                                        <span>
                                            {session.browser_name}{' '}
                                            {getMajorVersion(
                                                session.browser_version
                                            )}
                                        </span>
                                        <span> • </span>
                                        <span>
                                            {session.os_name}{' '}
                                            {getMajorVersion(
                                                session.os_version
                                            )}
                                        </span>
                                    </>
                                )}
                            </p>
                            {loading ? (
                                'loading'
                            ) : (
                                <div className={styles.socialIcons}>
                                    <FaFacebookSquare
                                        className={styles.socialIcon}
                                    />
                                    <FaLinkedin className={styles.socialIcon} />
                                    <FaGithubSquare
                                        className={styles.socialIcon}
                                    />
                                    <FaExternalLinkSquareAlt
                                        className={styles.socialIcon}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </>
        </div>
    );
};
