import { useAuthContext } from '@authentication/AuthContext';
import { Avatar } from '@components/Avatar/Avatar';
import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import { Skeleton } from '@components/Skeleton/Skeleton';
import Tooltip from '@components/Tooltip/Tooltip';
import {
    useGetEnhancedUserDetailsQuery,
    useMarkSessionAsStarredMutation,
} from '@graph/hooks';
import { GetEnhancedUserDetailsQuery } from '@graph/operations';
import { Maybe, Session, SocialLink, SocialType } from '@graph/schemas';
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

import UserIdentifier from '../../../components/UserIdentifier/UserIdentifier';
import { ReactComponent as StarIcon } from '../../../static/star.svg';
import { ReactComponent as FilledStarIcon } from '../../../static/star-filled.svg';
import { getIdentifiedUserProfileImage } from '../../Sessions/SessionsFeedV2/components/MinimalSessionCard/utils/utils';
import { useReplayerContext } from '../ReplayerContext';
import styles from './MetadataBox.module.scss';
import { getAbsoluteUrl, getMajorVersion } from './utils/utils';

export const MetadataBox = React.memo(() => {
    const { isLoggedIn } = useAuthContext();
    const { session_secure_id } = useParams<{ session_secure_id: string }>();
    const { session } = useReplayerContext();
    const [markSessionAsStarred] = useMarkSessionAsStarredMutation({
        update(cache) {
            cache.modify({
                fields: {
                    session(existingSession) {
                        return {
                            ...existingSession,
                            starred: !existingSession.starred,
                        };
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
});

export const UserDetailsBox = React.memo(() => {
    const { project_id, session_secure_id } = useParams<{
        project_id: string;
        session_secure_id: string;
    }>();
    const { data, loading } = useGetEnhancedUserDetailsQuery({
        variables: { session_secure_id },
        fetchPolicy: 'no-cache',
    });

    if (loading) {
        return null;
    }

    if (!data?.enhanced_user_details) {
        return (
            <Tooltip
                mouseEnterDelay={0.3}
                title={
                    <a
                        href={`/w/${project_id}/billing`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Workspace tier does not include enhanced user details.
                        Click here to see upgrade options
                    </a>
                }
            >
                <div className={styles.userEnhanced}>
                    <div style={{ width: 36 }}>
                        <div className={styles.blurred}>
                            <Avatar
                                seed="test"
                                className={styles.enhancedAvatar}
                            />
                        </div>
                    </div>
                    <div className={styles.enhancedTextSection}>
                        <div className={styles.blurred}>
                            <SocialComponent
                                disabled
                                socialLink={
                                    {
                                        link: 'http://example.com',
                                        type: 'Github',
                                    } as SocialLink
                                }
                                key={'example'}
                            />
                            SOME INTERESTING DETAILS HERE
                        </div>
                    </div>
                </div>
            </Tooltip>
        );
    }

    if (!hasEnrichedData(data)) {
        return null;
    }

    return (
        <div className={styles.userEnhanced}>
            {!loading && (
                <div className={styles.tooltip}>
                    <InfoTooltip
                        title={`This is enriched information for ${data?.enhanced_user_details?.email}. Highlight shows additional information like social handles, website, title, and company. This feature is currently enabled for everyone but will later only be available starting at the Startup plan.`}
                        size="medium"
                        hideArrow
                        placement="topLeft"
                    />
                </div>
            )}
            {loading ? (
                <Skeleton circle={true} height={36} width={36} />
            ) : (
                <div style={{ width: 36 }}>
                    {data?.enhanced_user_details?.avatar && (
                        <Avatar
                            seed="test"
                            customImage={data.enhanced_user_details.avatar}
                            className={styles.enhancedAvatar}
                        />
                    )}
                </div>
            )}
            <div className={styles.enhancedTextSection}>
                {loading ? (
                    <Skeleton height="2rem" />
                ) : (
                    <div className={styles.enhancedLinksGrid}>
                        {data?.enhanced_user_details?.name && (
                            <h4 id={styles.enhancedName}>
                                {data?.enhanced_user_details?.name}
                            </h4>
                        )}
                        {data?.enhanced_user_details?.bio && (
                            <p className={styles.enhancedBio}>
                                {data?.enhanced_user_details?.bio}
                            </p>
                        )}
                        {data?.enhanced_user_details?.socials?.map(
                            (e) =>
                                e && (
                                    <SocialComponent
                                        socialLink={e}
                                        key={e.type}
                                    />
                                )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

const SocialComponent = ({
    socialLink,
    disabled,
}: {
    socialLink: SocialLink;
    disabled?: boolean;
}) => {
    const inner = (
        <>
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
        </>
    );
    if (disabled) {
        return <span className={styles.enhancedSocial}>{inner}</span>;
    }
    return (
        <a
            className={styles.enhancedSocial}
            href={getAbsoluteUrl(socialLink.link ?? '')}
            target="_blank"
            rel="noopener noreferrer"
        >
            {inner}
        </a>
    );
};

const hasEnrichedData = (enhancedData?: GetEnhancedUserDetailsQuery) => {
    if (!enhancedData) {
        return false;
    }

    const { enhanced_user_details } = enhancedData;

    return (
        (!!enhanced_user_details?.avatar &&
            enhanced_user_details?.avatar !== '') ||
        (!!enhanced_user_details?.bio && enhanced_user_details?.bio !== '') ||
        (!!enhanced_user_details?.name && enhanced_user_details?.name !== '') ||
        enhanced_user_details?.socials?.length ||
        0 > 0
    );
};
