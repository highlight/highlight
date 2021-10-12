import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import React from 'react';
import {
    FaExternalLinkSquareAlt,
    FaFacebookSquare,
    FaGithubSquare,
    FaLinkedin,
    FaTwitterSquare,
} from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';

import { useAuthContext } from '../../../authentication/AuthContext';
import { Avatar } from '../../../components/Avatar/Avatar';
import UserIdentifier from '../../../components/UserIdentifier/UserIdentifier';
import {
    useGetEnhancedUserDetailsQuery,
    useMarkSessionAsStarredMutation,
} from '../../../graph/generated/hooks';
import {
    Maybe,
    Session,
    SocialLink,
    SocialType,
} from '../../../graph/generated/schemas';
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
            <div className={styles.userMainSection}>
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
                        </>
                    )}
                </div>
            </div>
            <UserDetailsBox />
        </div>
    );
};

export const UserDetailsBox = () => {
    const { session_secure_id } = useParams<{ session_secure_id: string }>();
    const { loading, data } = useGetEnhancedUserDetailsQuery({
        variables: { session_secure_id },
    });

    return (
        <div className={styles.userEnhanced}>
            {loading ? (
                <Skeleton circle={true} height={36} width={36} />
            ) : (
                <Avatar
                    seed="test"
                    customImage={
                        data?.enhanced_user_details?.avatar ?? undefined
                    }
                    className={styles.enhancedAvatar}
                />
            )}
            <div className={styles.enhancedTextSection}>
                <h4 className={styles.enhancedName}>
                    {data?.enhanced_user_details?.name}
                </h4>
                <p className={styles.enhancedBio}>
                    {data?.enhanced_user_details?.bio}
                </p>
                {data?.enhanced_user_details?.socials?.map(
                    (e) => e && <SocialComponent socialLink={e} />
                )}
            </div>
        </div>
    );
};

const SocialComponent = ({ socialLink }: { socialLink: SocialLink }) => {
    return (
        <a
            className={styles.enhancedSocial}
            href={socialLink.link ?? ''}
            target="_blank"
            rel="noopener noreferrer"
        >
            {socialLink?.type === SocialType.Github ? (
                <FaGithubSquare />
            ) : socialLink?.type === SocialType.Facebook ? (
                <FaFacebookSquare />
            ) : socialLink?.type === SocialType.Twitter ? (
                <FaTwitterSquare />
            ) : socialLink?.type === SocialType.Site ? (
                <FaExternalLinkSquareAlt />
            ) : socialLink?.type === SocialType.LinkedIn ? (
                <FaLinkedin />
            ) : (
                <></>
            )}
            <p className={styles.enhancedSocialText}>{socialLink.type}</p>
        </a>
    );
};
