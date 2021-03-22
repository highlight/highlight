import React, { useContext, useEffect } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { SearchContext, SearchParams } from '../../SearchContext/SearchContext';
import { ReactComponent as CheckIcon } from '../../../../static/check.svg';
import Skeleton from 'react-loading-skeleton';

import styles from './SegmentPicker.module.scss';
import {
    useGetSegmentsQuery,
    useUnprocessedSessionsCountQuery,
} from '../../../../graph/generated/hooks';
import { gqlSanitize } from '../../../../util/gqlSanitize';
import classNames from 'classnames';
import { Tooltip } from 'antd';

export const LIVE_SEGMENT_ID = 'live';

export const SegmentPicker = () => {
    const { setSearchParams, setSegmentName, setExistingParams } = useContext(
        SearchContext
    );
    const { segment_id, organization_id } = useParams<{
        segment_id: string;
        organization_id: string;
    }>();

    const { loading, data } = useGetSegmentsQuery({
        variables: { organization_id },
    });
    const history = useHistory();
    const {
        data: unprocessedSessionsCount,
        loading: unprocessedSessionsLoading,
    } = useUnprocessedSessionsCountQuery({
        variables: { organization_id },
        pollInterval: 5000,
    });
    const currentSegment = data?.segments?.find((s) => s?.id === segment_id);

    useEffect(() => {
        if (segment_id) {
            if (segment_id === LIVE_SEGMENT_ID) {
                return;
            }
            if (currentSegment) {
                const newParams: any = { ...currentSegment.params };
                const parsed: SearchParams = gqlSanitize(newParams);
                setSegmentName(currentSegment.name);
                setSearchParams(parsed);
                setExistingParams(parsed);
            } else {
                // Redirect home since the segment doesn't exist anymore.
                history.replace(`/${organization_id}/sessions`);
            }
        }
    }, [
        currentSegment,
        setSegmentName,
        setSearchParams,
        setExistingParams,
        segment_id,
        history,
        organization_id,
    ]);

    return (
        <div className={styles.segmentPickerMenu}>
            {loading ? (
                <div>
                    <Skeleton height={70} style={{ marginBottom: 8 }} />
                </div>
            ) : (
                <div className={styles.segmentPickerInner}>
                    <Link to={`/${organization_id}/sessions`} key={'sessions'}>
                        <div className={styles.segmentItem}>
                            <div
                                className={classNames(
                                    styles.segmentText,
                                    (currentSegment || segment_id) &&
                                        styles.segmentUnselected
                                )}
                            >
                                All Sessions
                            </div>
                            {!currentSegment && !segment_id && (
                                <CheckIcon className={styles.checkIcon} />
                            )}
                        </div>
                    </Link>
                    <Link
                        to={`/${organization_id}/sessions/segment/${LIVE_SEGMENT_ID}`}
                        key={'live-sessions'}
                    >
                        <div className={styles.segmentItem}>
                            <div
                                className={classNames(
                                    styles.segmentText,
                                    styles.liveSessionsSegment,
                                    {
                                        [styles.segmentUnselected]:
                                            segment_id !== LIVE_SEGMENT_ID,
                                    }
                                )}
                            >
                                Live Sessions
                                {!unprocessedSessionsLoading && (
                                    <Tooltip title="The number of live sessions">
                                        <div
                                            className={classNames(
                                                styles.liveSessionsCount,
                                                {
                                                    [styles.liveSessionsCountInactive]:
                                                        segment_id !==
                                                        LIVE_SEGMENT_ID,
                                                }
                                            )}
                                        >
                                            {unprocessedSessionsCount?.unprocessedSessionsCount ??
                                                0}
                                        </div>
                                    </Tooltip>
                                )}
                            </div>
                            {LIVE_SEGMENT_ID === segment_id && (
                                <CheckIcon className={styles.checkIcon} />
                            )}
                        </div>
                    </Link>
                    {data?.segments?.map((s) => (
                        <Link
                            to={`/${organization_id}/sessions/segment/${s?.id}`}
                            key={s?.id}
                        >
                            <div className={styles.segmentItem}>
                                <div
                                    className={classNames(
                                        styles.segmentText,
                                        s?.id != currentSegment?.id &&
                                            styles.segmentUnselected
                                    )}
                                >
                                    {s?.name}
                                </div>
                                {s?.id === currentSegment?.id && (
                                    <CheckIcon className={styles.checkIcon} />
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
