import classNames from 'classnames';
import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { Avatar } from '../../../../../components/Avatar/Avatar';
import Tooltip from '../../../../../components/Tooltip/Tooltip';
import { Maybe, Session } from '../../../../../graph/generated/schemas';
import SvgEyeOffIcon from '../../../../../static/EyeOffIcon';
import SvgFaceIdIcon from '../../../../../static/FaceIdIcon';
import SvgFastForwardIcon from '../../../../../static/FastForwardIcon';
import SvgUserPlusIcon from '../../../../../static/UserPlusIcon';
import { MillisToMinutesAndSecondsVerbose } from '../../../../../util/time';
import { LIVE_SEGMENT_ID } from '../../../SearchSidebar/SegmentPicker/SegmentPicker';
import styles from './MinimalSessionCard.module.scss';

interface Props {
    session: Maybe<Session>;
    selected: boolean;
}

const MinimalSessionCard = ({ session, selected }: Props) => {
    const { organization_id, segment_id } = useParams<{
        organization_id: string;
        segment_id: string;
    }>();

    return (
        <div className={styles.sessionCardWrapper} key={session?.id}>
            <Link to={`/${organization_id}/sessions/${session?.id}`}>
                <div
                    className={classNames(styles.sessionCard, {
                        [styles.selected]: selected,
                    })}
                >
                    <div className={styles.sessionCardContentWrapper}>
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
                            <div className={styles.sessionTextSection}>
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
                            <div className={styles.sessionTextSection}>
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
                            </div>
                        </div>

                        <div className={styles.cardAnnotationContainer}>
                            <div>
                                {!session?.viewed && (
                                    <Tooltip title="This session hasn't been viewed by you.">
                                        <span
                                            className={styles.cardAnnotation}
                                            style={
                                                {
                                                    '--primary-color':
                                                        'var(--color-blue-400)',
                                                } as React.CSSProperties
                                            }
                                        >
                                            <SvgEyeOffIcon />
                                        </span>
                                    </Tooltip>
                                )}
                            </div>
                            <div>
                                {session?.first_time && (
                                    <Tooltip title="This session is for a new user.">
                                        <span
                                            className={styles.cardAnnotation}
                                            style={
                                                {
                                                    '--primary-color':
                                                        'var(--color-red)',
                                                } as React.CSSProperties
                                            }
                                        >
                                            <SvgUserPlusIcon />
                                        </span>
                                    </Tooltip>
                                )}
                            </div>
                            <div>
                                {session?.identifier && (
                                    <Tooltip title="This session is for a known user.">
                                        <span
                                            className={styles.cardAnnotation}
                                            style={
                                                {
                                                    '--primary-color':
                                                        'var(--color-orange-400)',
                                                } as React.CSSProperties
                                            }
                                        >
                                            <SvgFaceIdIcon />
                                        </span>
                                    </Tooltip>
                                )}
                            </div>
                            <div>
                                {session?.processed && (
                                    <Tooltip title="This is a live, in-progress session.">
                                        <span
                                            className={styles.cardAnnotation}
                                            style={
                                                {
                                                    '--primary-color':
                                                        'var(--color-purple-400)',
                                                } as React.CSSProperties
                                            }
                                        >
                                            <SvgFastForwardIcon />
                                        </span>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default MinimalSessionCard;
