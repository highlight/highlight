import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { ALERT_CONFIGURATIONS } from '@pages/Alerts/Alerts';
import { formatShortTime } from '@pages/Home/components/KeyPerformanceIndicators/utils/utils';
import ActivityGraph from '@pages/Sessions/SessionsFeedV2/components/ActivityGraph/ActivityGraph';
import { formatDatetime } from '@pages/Sessions/SessionsFeedV2/components/SessionFeedConfiguration/SessionFeedConfiguration';
import { SessionFeedConfigurationContext } from '@pages/Sessions/SessionsFeedV2/context/SessionFeedConfigurationContext';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import TextTransition from 'react-text-transition';

import { Avatar } from '../../../../../components/Avatar/Avatar';
import { Maybe, Session } from '../../../../../graph/generated/schemas';
import SvgEyeOffIcon from '../../../../../static/EyeOffIcon';
import SvgFastForwardIcon from '../../../../../static/FastForwardIcon';
import { MillisToMinutesAndSecondsVerbose } from '../../../../../util/time';
import { LIVE_SEGMENT_ID } from '../../../SearchSidebar/SegmentPicker/SegmentPicker';
import styles from './MinimalSessionCard.module.scss';
import { getDisplayName, getIdentifiedUserProfileImage } from './utils/utils';

interface Props {
    session: Maybe<Session>;
    selected: boolean;
    /** Whether MinimalSessionCard is rendered on an error page where we don't have the full session information. */
    errorVersion?: boolean;
    showDetailedViewOverride?: boolean;
    /** URL Params to attach to the session URL. */
    urlParams?: string;
    linkDisabled?: boolean;
    showDetailedSessionView?: boolean;
    autoPlaySessions?: boolean;
    configuration?: SessionFeedConfigurationContext;
}

const MinimalSessionCard = React.memo(
    ({
        session,
        selected,
        errorVersion = false,
        showDetailedViewOverride = false,
        urlParams,
        linkDisabled,
        autoPlaySessions = false,
        showDetailedSessionView: showDetailedSessionViewPlayerConfiguration = false,
        configuration,
    }: Props) => {
        const ref = useRef<HTMLDivElement | null>(null);
        const { project_id, segment_id, session_secure_id } = useParams<{
            project_id: string;
            segment_id: string;
            session_secure_id: string;
        }>();
        const projectIdRemapped =
            project_id === DEMO_WORKSPACE_APPLICATION_ID
                ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
                : project_id;
        const showDetailedSessionView =
            showDetailedSessionViewPlayerConfiguration ||
            showDetailedViewOverride;

        const [viewed, setViewed] = useState(session?.viewed || false);

        useEffect(() => {
            if (session_secure_id === session?.secure_id) {
                setViewed(true);
            }
        }, [session?.secure_id, session_secure_id]);

        const [eventCounts, setEventCounts] = useState(undefined);

        useEffect(() => {
            if (!!session?.event_counts) {
                setEventCounts(
                    JSON.parse(session.event_counts).map(
                        (v: number, k: number) => {
                            return { ts: k, value: v };
                        }
                    )
                );
            }
        }, [session?.event_counts, setEventCounts]);

        useEffect(() => {
            if (
                autoPlaySessions &&
                session_secure_id === session?.secure_id &&
                ref?.current
            ) {
                ref.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }, [autoPlaySessions, session?.secure_id, session_secure_id]);

        const customAvatarImage = getIdentifiedUserProfileImage(session);

        const innerContent = (
            <div
                className={classNames(styles.sessionCard, {
                    [styles.selected]: selected,
                    [styles.linkDisabled]: linkDisabled,
                })}
            >
                <div
                    className={classNames(styles.sessionCardContentWrapper, {
                        [styles.detailed]: showDetailedSessionView,
                        [styles.errorVersion]: errorVersion,
                    })}
                >
                    <div className={styles.avatarWrapper}>
                        <Avatar
                            seed={
                                (session?.identifier
                                    ? session?.identifier
                                    : (
                                          session?.fingerprint || ''
                                      ).toString()) ?? ''
                            }
                            style={{ height: 25, width: 25 }}
                            customImage={customAvatarImage}
                        />
                    </div>
                    <div className={styles.sessionTextSectionWrapper}>
                        <div
                            className={classNames(styles.sessionTextSection, {
                                [styles.detailed]: showDetailedSessionView,
                                [styles.errorVersion]: errorVersion,
                            })}
                        >
                            <div
                                className={classNames(
                                    styles.middleText,
                                    'highlight-block'
                                )}
                            >
                                {getDisplayName(session)}
                            </div>
                        </div>
                        <div
                            className={classNames(styles.sessionTextSection, {
                                [styles.detailedSection]: showDetailedSessionView,
                                [styles.withLongDatetimeFormat]:
                                    configuration?.datetimeFormat === 'ISO',
                            })}
                        >
                            {showDetailedSessionView ? (
                                <>
                                    {!errorVersion && (
                                        <div className={styles.topText}>
                                            {session?.processed &&
                                            segment_id !== LIVE_SEGMENT_ID ? (
                                                <>
                                                    {formatShortTime(
                                                        (session.active_length ||
                                                            0) / 1000,
                                                        ['h', 'm', 's']
                                                    )}
                                                    <span
                                                        className={
                                                            styles.separator
                                                        }
                                                    >
                                                        •
                                                    </span>
                                                    {(
                                                        ((session?.active_length ||
                                                            1) /
                                                            (session?.length ||
                                                                1)) *
                                                        100
                                                    ).toFixed(0)}
                                                    % Active{' '}
                                                </>
                                            ) : (
                                                'Live'
                                            )}
                                        </div>
                                    )}
                                    {errorVersion ? (
                                        <div className={styles.topText}>
                                            {session?.os_name}
                                        </div>
                                    ) : (
                                        <div className={styles.topText}>
                                            {`${
                                                session?.city && session?.state
                                                    ? `${session?.city}, ${session?.state}`
                                                    : ''
                                            }`}
                                        </div>
                                    )}
                                    <div className={styles.topText}>
                                        <TextTransition
                                            text={
                                                configuration?.datetimeFormat
                                                    ? formatDatetime(
                                                          session?.created_at,
                                                          configuration.datetimeFormat
                                                      )
                                                    : `${new Date(
                                                          session?.created_at
                                                      ).toLocaleString(
                                                          'en-us',
                                                          {
                                                              day: 'numeric',
                                                              month: 'long',
                                                              year: 'numeric',
                                                          }
                                                      )}`
                                            }
                                            inline
                                        />
                                    </div>
                                    <div className={styles.topText}>
                                        {`${session?.browser_name}`}
                                    </div>
                                    {errorVersion && (
                                        <div className={styles.topText}>
                                            {`${session?.environment}`}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className={styles.topText}>
                                    {session?.processed &&
                                    segment_id !== LIVE_SEGMENT_ID
                                        ? MillisToMinutesAndSecondsVerbose(
                                              session.active_length || 0
                                          )
                                        : !errorVersion
                                        ? 'Live'
                                        : new Date(
                                              session?.created_at
                                          ).toLocaleString('en-us', {
                                              day: 'numeric',
                                              month: 'long',
                                              year: 'numeric',
                                          })}
                                </div>
                            )}
                        </div>
                    </div>

                    {!errorVersion && (
                        <div
                            className={classNames(
                                styles.cardAnnotationContainer,
                                {
                                    [styles.detailed]: showDetailedSessionView,
                                }
                            )}
                        >
                            <div>
                                <span
                                    className={styles.cardAnnotation}
                                    style={
                                        {
                                            '--primary-color': !viewed
                                                ? 'var(--color-blue-400)'
                                                : 'var(--color-gray-300)',
                                        } as React.CSSProperties
                                    }
                                >
                                    <SvgEyeOffIcon />
                                </span>
                            </div>
                            <div>
                                <span
                                    className={styles.cardAnnotation}
                                    style={
                                        {
                                            '--primary-color': session?.first_time
                                                ? 'var(--color-red)'
                                                : 'var(--color-gray-300)',
                                        } as React.CSSProperties
                                    }
                                >
                                    {
                                        ALERT_CONFIGURATIONS['NEW_USER_ALERT']
                                            .icon
                                    }
                                </span>
                            </div>
                            <div>
                                <span
                                    className={styles.cardAnnotation}
                                    style={
                                        {
                                            '--primary-color': session?.identifier
                                                ? 'var(--color-orange-400)'
                                                : 'var(--color-gray-300)',
                                        } as React.CSSProperties
                                    }
                                >
                                    {
                                        ALERT_CONFIGURATIONS[
                                            'USER_PROPERTIES_ALERT'
                                        ].icon
                                    }
                                </span>
                            </div>
                            <div>
                                <span
                                    className={styles.cardAnnotation}
                                    style={
                                        {
                                            '--primary-color': !session?.processed
                                                ? 'var(--color-purple-400)'
                                                : 'var(--color-gray-300)',
                                        } as React.CSSProperties
                                    }
                                >
                                    <SvgFastForwardIcon />
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {!errorVersion && showDetailedSessionView && eventCounts && (
                    <div className={styles.activityGraphContainer}>
                        <ActivityGraph data={eventCounts} />
                    </div>
                )}
            </div>
        );

        return (
            <div
                className={styles.sessionCardWrapper}
                key={session?.secure_id}
                ref={ref}
            >
                {linkDisabled ? (
                    innerContent
                ) : (
                    <Link
                        to={`/${projectIdRemapped}/sessions/${
                            session?.secure_id
                        }${urlParams || ''}`}
                    >
                        {innerContent}
                    </Link>
                )}
            </div>
        );
    }
);

export default MinimalSessionCard;
