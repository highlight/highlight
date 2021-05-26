import { message } from 'antd';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Avatar } from '../../../../../components/Avatar/Avatar';
import Dot from '../../../../../components/Dot/Dot';
import { Field } from '../../../../../components/Field/Field';
import Tooltip from '../../../../../components/Tooltip/Tooltip';
import {
    useMarkSessionAsStarredMutation,
    useMarkSessionAsViewedMutation,
} from '../../../../../graph/generated/hooks';
import { Maybe, Session } from '../../../../../graph/generated/schemas';
import { ReactComponent as StarIcon } from '../../../../../static/star.svg';
import { ReactComponent as FilledStarIcon } from '../../../../../static/star-filled.svg';
import { ReactComponent as UnviewedIcon } from '../../../../../static/unviewed.svg';
import { ReactComponent as ViewedIcon } from '../../../../../static/viewed.svg';
import { MillisToMinutesAndSecondsVerbose } from '../../../../../util/time';
import { LIVE_SEGMENT_ID } from '../../../SearchSidebar/SegmentPicker/SegmentPicker';
import FirstTimeDecorations from '../FirstTimeDecorations/FirstTimeDecorations';
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
    const [hovered, setHovered] = useState(false);
    const [markSessionAsViewed] = useMarkSessionAsViewedMutation();
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
    const containerRef = useRef<HTMLDivElement>(null);
    return (
        <div
            className={styles.sessionCardWrapper}
            key={session?.id}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {(session?.starred || hovered) && (
                <Tooltip title={session?.starred ? 'Unstar' : 'Star'}>
                    <div
                        className={styles.starredIconWrapper}
                        onClick={() => {
                            markSessionAsStarred({
                                variables: {
                                    id: session?.id || '',
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
                            <StarIcon className={styles.actionIcon} />
                        )}
                    </div>
                </Tooltip>
            )}
            <Link to={`/${organization_id}/sessions/${session?.id}`}>
                <div
                    className={classNames(styles.sessionCard, {
                        [styles.selected]: selected,
                    })}
                    ref={containerRef}
                >
                    <FirstTimeDecorations
                        containerRef={containerRef}
                        session={session}
                    />
                    <div
                        className={classNames(
                            styles.hoverBorderLeft,
                            hovered && !selected && styles.hoverBorderOn
                        )}
                    />
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
                                style={{ height: 50, width: 50 }}
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

                                {(session?.fields?.length || 0) > 0 && (
                                    <div className={styles.tagWrapper}>
                                        {session?.fields
                                            ?.filter(
                                                (f) =>
                                                    f?.type === 'user' &&
                                                    f?.name !== 'identifier' &&
                                                    f?.value.length
                                            )
                                            .map(
                                                (f) =>
                                                    f && (
                                                        <Field
                                                            color={'normal'}
                                                            key={f.value}
                                                            k={f.name}
                                                            v={f.value}
                                                        />
                                                    )
                                            )}
                                    </div>
                                )}
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
                        <div className={styles.readMarkerContainer}>
                            {!session?.viewed && <Dot />}
                        </div>
                    </div>
                    <div
                        className={classNames(
                            styles.hoverBorderRight,
                            hovered && styles.hoverBorderOn
                        )}
                    />
                </div>
            </Link>
            <Tooltip
                title={session?.viewed ? 'Mark as Unviewed' : 'Mark as Viewed'}
            >
                <button
                    className={styles.sessionCardAction}
                    onClick={() => {
                        markSessionAsViewed({
                            variables: {
                                id: session?.id || '',
                                viewed: !session?.viewed,
                            },
                        })
                            .then(() => {
                                message.success('Updated session status!', 3);
                            })
                            .catch(() => {
                                message.error(
                                    'Error updating session status!',
                                    3
                                );
                            });
                    }}
                >
                    {session?.viewed ? (
                        <UnviewedIcon className={styles.actionIcon} />
                    ) : (
                        <ViewedIcon className={styles.actionIcon} />
                    )}
                </button>
            </Tooltip>
        </div>
    );
};

export default MinimalSessionCard;
