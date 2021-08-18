import classNames from 'classnames';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link, useParams } from 'react-router-dom';

import Button from '../../../../components/Button/Button/Button';
import Tooltip from '../../../../components/Tooltip/Tooltip';
import {
    useGetSegmentsQuery,
    useUnprocessedSessionsCountQuery,
} from '../../../../graph/generated/hooks';
import { ReactComponent as CheckIcon } from '../../../../static/check.svg';
import { ReactComponent as TrashIcon } from '../../../../static/trash.svg';
import { gqlSanitize } from '../../../../util/gqlSanitize';
import { EmptySessionsSearchParams } from '../../EmptySessionsSearchParams';
import { useSearchContext } from '../../SearchContext/SearchContext';
import DeleteSessionSegmentModal from './DeleteSessionSegmentModal/DeleteSessionSegmentModal';
import styles from './SegmentPicker.module.scss';

export const LIVE_SEGMENT_ID = 'live';
export const STARRED_SEGMENT_ID = 'starred';

export const SegmentPicker = () => {
    const {
        setSearchParams,
        setSegmentName,
        setExistingParams,
        searchParams,
        existingParams,
    } = useSearchContext();
    const { segment_id, organization_id } = useParams<{
        segment_id: string;
        organization_id: string;
    }>();

    const { loading, data } = useGetSegmentsQuery({
        variables: { organization_id },
    });
    const {
        data: unprocessedSessionsCount,
        loading: unprocessedSessionsLoading,
    } = useUnprocessedSessionsCountQuery({
        variables: { organization_id },
        // pollInterval: 1000 * 10,
    });
    const currentSegment = data?.segments?.find((s) => s?.id === segment_id);

    const [showDeleteSegmentModal, setShowDeleteSegmentModal] = useState(false);
    const [segmentToDelete, setSegmentToDelete] = useState<{
        name?: string;
        id?: string;
    } | null>(null);

    useEffect(() => {
        if (data && segment_id) {
            if (
                segment_id === LIVE_SEGMENT_ID ||
                segment_id === STARRED_SEGMENT_ID
            ) {
                setSegmentName(null);
                setExistingParams(EmptySessionsSearchParams);
            } else {
                if (_.isEqual(EmptySessionsSearchParams, existingParams)) {
                    const segmentParameters = gqlSanitize({
                        ...currentSegment?.params,
                    });
                    setExistingParams(segmentParameters);
                    setSearchParams(segmentParameters);
                    setSegmentName(currentSegment?.name || null);
                }
            }
        } else if (!segment_id && data) {
            setSegmentName(null);
            setExistingParams(EmptySessionsSearchParams);
        }
    }, [
        currentSegment?.name,
        currentSegment?.params,
        data,
        existingParams,
        searchParams,
        segment_id,
        setExistingParams,
        setSearchParams,
        setSegmentName,
    ]);

    return (
        <>
            <DeleteSessionSegmentModal
                showModal={showDeleteSegmentModal}
                hideModalHandler={() => {
                    setShowDeleteSegmentModal(false);
                }}
                segmentToDelete={segmentToDelete}
            />
            <div className={styles.segmentPickerMenu}>
                {loading ? (
                    <div>
                        <Skeleton height={70} style={{ marginBottom: 8 }} />
                    </div>
                ) : (
                    <div className={styles.segmentPickerInner}>
                        <div className={styles.segmentItemWrapper}>
                            <Link
                                to={{
                                    pathname: `/${organization_id}/sessions`,
                                }}
                                key={'sessions'}
                                onClick={() => {
                                    setExistingParams(
                                        EmptySessionsSearchParams
                                    );
                                    setSearchParams(EmptySessionsSearchParams);
                                }}
                            >
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
                                        <CheckIcon
                                            className={styles.checkIcon}
                                        />
                                    )}
                                </div>
                            </Link>
                        </div>
                        <div className={styles.segmentItemWrapper}>
                            <Link
                                to={`/${organization_id}/sessions/segment/${LIVE_SEGMENT_ID}`}
                                key={'live-sessions'}
                                onClick={() => {
                                    setExistingParams(
                                        EmptySessionsSearchParams
                                    );
                                    setSearchParams(EmptySessionsSearchParams);
                                }}
                            >
                                <div className={styles.segmentItem}>
                                    <div
                                        className={classNames(
                                            styles.segmentText,
                                            styles.liveSessionsSegment,
                                            {
                                                [styles.segmentUnselected]:
                                                    segment_id !==
                                                    LIVE_SEGMENT_ID,
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
                                        <CheckIcon
                                            className={styles.checkIcon}
                                        />
                                    )}
                                </div>
                            </Link>
                        </div>
                        <div className={styles.segmentItemWrapper}>
                            <Link
                                to={`/${organization_id}/sessions/segment/${STARRED_SEGMENT_ID}`}
                                key={'starred-sessions'}
                                onClick={() => {
                                    setExistingParams(
                                        EmptySessionsSearchParams
                                    );
                                    setSearchParams(EmptySessionsSearchParams);
                                }}
                            >
                                <div className={styles.segmentItem}>
                                    <div
                                        className={classNames(
                                            styles.segmentText,
                                            styles.liveSessionsSegment,
                                            {
                                                [styles.segmentUnselected]:
                                                    segment_id !==
                                                    STARRED_SEGMENT_ID,
                                            }
                                        )}
                                    >
                                        Starred Sessions
                                    </div>
                                    {STARRED_SEGMENT_ID === segment_id && (
                                        <CheckIcon
                                            className={styles.checkIcon}
                                        />
                                    )}
                                </div>
                            </Link>
                        </div>
                        {data?.segments?.map((s) => (
                            <div
                                className={styles.segmentItemWrapper}
                                key={s?.id}
                            >
                                <Link
                                    to={{
                                        pathname: `/${organization_id}/sessions/segment/${s?.id}`,
                                    }}
                                    onClick={() => {
                                        const segmentParameters = gqlSanitize({
                                            ...s?.params,
                                        });
                                        setExistingParams(segmentParameters);
                                        setSearchParams(segmentParameters);
                                        setSegmentName(s?.name || null);
                                    }}
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
                                            <CheckIcon
                                                className={styles.checkIcon}
                                            />
                                        )}
                                    </div>
                                </Link>
                                <Button
                                    trackingId="DeleteSessionSegmentIcon"
                                    type="text"
                                    className={styles.segmentAction}
                                    onClick={() => {
                                        setShowDeleteSegmentModal(true);
                                        setSegmentToDelete(s);
                                    }}
                                >
                                    <TrashIcon className={styles.trashIcon} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};
