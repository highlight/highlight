import classNames from 'classnames';
import React, { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Avatar } from '../../../../../components/Avatar/Avatar';
import Tooltip from '../../../../../components/Tooltip/Tooltip';
import {
    useMarkSessionAsStarredMutation,
    useMarkSessionAsViewedMutation,
} from '../../../../../graph/generated/hooks';
import { Maybe, Session } from '../../../../../graph/generated/schemas';
import { MillisToMinutesAndSecondsVerbose } from '../../../../../util/time';
import { LIVE_SEGMENT_ID } from '../../../SearchSidebar/SegmentPicker/SegmentPicker';
import FirstTimeDecorations from '../../../SessionsFeed/components/FirstTimeDecorations/FirstTimeDecorations';
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
        <div className={styles.sessionCardWrapper} key={session?.id}>
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
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default MinimalSessionCard;
