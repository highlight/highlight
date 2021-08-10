import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Avatar } from '../../../../../components/Avatar/Avatar';
import Tooltip from '../../../../../components/Tooltip/Tooltip';
import { Maybe, Session } from '../../../../../graph/generated/schemas';
import SvgEyeOffIcon from '../../../../../static/EyeOffIcon';
import SvgFaceIdIcon from '../../../../../static/FaceIdIcon';
import SvgFastForwardIcon from '../../../../../static/FastForwardIcon';
import SvgUserPlusIcon from '../../../../../static/UserPlusIcon';
import { MillisToMinutesAndSecondsVerbose } from '../../../../../util/time';
import usePlayerConfiguration from '../../../../Player/PlayerHook/utils/usePlayerConfiguration';
import { LIVE_SEGMENT_ID } from '../../../SearchSidebar/SegmentPicker/SegmentPicker';
import styles from './MinimalSessionCard.module.scss';

interface Props {
    session: Maybe<Session>;
    selected: boolean;
}

const MinimalSessionCard = ({ session, selected }: Props) => {
    const { organization_id, segment_id, session_id } = useParams<{
        organization_id: string;
        segment_id: string;
        session_id: string;
    }>();
    const { showDetailedSessionView } = usePlayerConfiguration();

    const [viewed, setViewed] = useState(session?.viewed || false);

    useEffect(() => {
        if (session_id === session?.id) {
            setViewed(true);
        }
    }, [session?.id, session_id]);

    return (
        <div className={styles.sessionCardWrapper} key={session?.id}>
            <Link to={`/${organization_id}/sessions/${session?.id}`}>
                <div
                    className={classNames(styles.sessionCard, {
                        [styles.selected]: selected,
                    })}
                >
                    <div
                        className={classNames(
                            styles.sessionCardContentWrapper,
                            { [styles.detailed]: showDetailedSessionView }
                        )}
                    >
                        <div className={styles.avatarWrapper}>
                            <Avatar
                                seed={
                                    (session?.identifier
                                        ? session?.identifier
                                        : (
                                              session?.fingerprint ||
                                              session?.user_id ||
                                              ''
                                          ).toString()) ?? ''
                                }
                                style={{ height: 25, width: 25 }}
                            />
                        </div>
                        <div className={styles.sessionTextSectionWrapper}>
                            <div
                                className={classNames(
                                    styles.sessionTextSection,
                                    {
                                        [styles.detailed]: showDetailedSessionView,
                                    }
                                )}
                            >
                                <div
                                    className={classNames(
                                        styles.middleText,
                                        'highlight-block'
                                    )}
                                >
                                    {session?.identifier ||
                                        `#${
                                            session?.fingerprint ||
                                            session?.user_id
                                        }`}
                                </div>
                            </div>
                            <div
                                className={classNames(
                                    styles.sessionTextSection,
                                    {
                                        [styles.detailedSection]: showDetailedSessionView,
                                    }
                                )}
                            >
                                {showDetailedSessionView ? (
                                    <>
                                        <div className={styles.topText}>
                                            {session?.processed &&
                                            segment_id !== LIVE_SEGMENT_ID
                                                ? MillisToMinutesAndSecondsVerbose(
                                                      session.active_length || 0
                                                  )
                                                : 'Live'}
                                        </div>
                                        <Tooltip
                                            title={`${session?.city}, ${session?.state}`}
                                        >
                                            <div className={styles.topText}>
                                                {`${session?.city}, ${session?.state}`}
                                            </div>
                                        </Tooltip>
                                        <Tooltip
                                            title={`${new Date(
                                                session?.created_at
                                            )}`}
                                        >
                                            <div className={styles.topText}>
                                                {`${new Date(
                                                    session?.created_at
                                                ).toLocaleString('en-us', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}`}
                                            </div>
                                        </Tooltip>
                                        <Tooltip
                                            title={`${session?.browser_name}`}
                                        >
                                            <div className={styles.topText}>
                                                {`${session?.browser_name}`}
                                            </div>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <Tooltip
                                        title={
                                            session?.processed ? (
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td>Active:</td>
                                                            <td>
                                                                {MillisToMinutesAndSecondsVerbose(
                                                                    session.active_length ||
                                                                        0
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Total:</td>
                                                            <td>
                                                                {MillisToMinutesAndSecondsVerbose(
                                                                    session.length ||
                                                                        0
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            ) : null
                                        }
                                        align={{ offset: [-40, 0] }}
                                    >
                                        <div className={styles.topText}>
                                            {session?.processed &&
                                            segment_id !== LIVE_SEGMENT_ID
                                                ? MillisToMinutesAndSecondsVerbose(
                                                      session.active_length || 0
                                                  )
                                                : 'Live'}
                                        </div>
                                    </Tooltip>
                                )}
                            </div>
                        </div>

                        <div
                            className={classNames(
                                styles.cardAnnotationContainer,
                                { [styles.detailed]: showDetailedSessionView }
                            )}
                        >
                            <div>
                                <Tooltip
                                    title={
                                        !viewed
                                            ? `This session hasn't been viewed.`
                                            : 'This session has been viewed.'
                                    }
                                >
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
                                </Tooltip>
                            </div>
                            <div>
                                <Tooltip
                                    title={
                                        session?.first_time
                                            ? 'This session is the first time this user has used your app.'
                                            : 'This session is for a user that has used your app before.'
                                    }
                                >
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
                                        <SvgUserPlusIcon />
                                    </span>
                                </Tooltip>
                            </div>
                            <div>
                                <Tooltip title="This session is for a known user.">
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
                                        <SvgFaceIdIcon />
                                    </span>
                                </Tooltip>
                            </div>
                            <div>
                                <Tooltip
                                    title={
                                        !session?.processed
                                            ? 'This is a live, in-progress session.'
                                            : 'This is not a live, in-progress session.'
                                    }
                                >
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
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default MinimalSessionCard;
