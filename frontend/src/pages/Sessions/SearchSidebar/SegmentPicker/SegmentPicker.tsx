import React, { useContext, useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { SearchContext, SearchParams } from '../../SearchContext/SearchContext';
import { ReactComponent as CheckIcon } from '../../../../static/check.svg';
import { ReactComponent as TrashIcon } from '../../../../static/trash.svg';
import Skeleton from 'react-loading-skeleton';

import commonStyles from '../../../../Common.module.scss';
import styles from './SegmentPicker.module.scss';
import {
    useDeleteSegmentMutation,
    useGetSegmentsQuery,
    useUnprocessedSessionsCountQuery,
} from '../../../../graph/generated/hooks';
import { gqlSanitize } from '../../../../util/gqlSanitize';
import classNames from 'classnames';
import { message } from 'antd';
import { CircularSpinner } from '../../../../components/Loading/Loading';
import { EmptySessionsSearchParams } from '../../SessionsPage';
import _ from 'lodash';
import Modal from '../../../../components/Modal/Modal';
import Tooltip from '../../../../components/Tooltip/Tooltip';

export const LIVE_SEGMENT_ID = 'live';
export const STARRED_SEGMENT_ID = 'starred';
const NO_SEGMENT = 'none';

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
    const history = useHistory<SearchParams>();
    const {
        data: unprocessedSessionsCount,
        loading: unprocessedSessionsLoading,
    } = useUnprocessedSessionsCountQuery({
        variables: { organization_id },
        pollInterval: 5000,
    });
    const currentSegment = data?.segments?.find((s) => s?.id === segment_id);

    const [deleteClicked, setDeleteClicked] = useState(false);
    const [segmentToDelete, setSegmentToDelete] = useState<{
        name?: string;
        id?: string;
    } | null>();
    const [deleteSegment] = useDeleteSegmentMutation({
        update(cache) {
            cache.modify({
                fields: {
                    segments(existingSegments, { readField }) {
                        return existingSegments.filter(
                            (existingSegment: any) =>
                                readField('id', existingSegment) !==
                                segmentToDelete?.id
                        );
                    },
                },
            });
        },
    });

    useEffect(() => {
        if (segment_id) {
            if (segment_id === LIVE_SEGMENT_ID) {
                setSegmentName(null);
                return;
            }
            if (currentSegment) {
                if (
                    history.location.state &&
                    // history.location.state is empty when the user first loads the app and the route is deep-linked to a segment.
                    !_.isEqual(
                        history.location.state,
                        EmptySessionsSearchParams
                    )
                ) {
                    const parsed: SearchParams = gqlSanitize(
                        history.location.state
                    );
                    setSearchParams(parsed);
                    setExistingParams(parsed);
                } else {
                    const parsed: SearchParams = gqlSanitize({
                        ...currentSegment.params,
                    });
                    setSearchParams(parsed);
                    setExistingParams(parsed);
                }
                setSegmentName(currentSegment.name);
            } else {
                // Redirect home since the segment doesn't exist anymore.
                setSegmentName(null);
                history.replace(`/${organization_id}/sessions`);
            }
        } else {
            setSearchParams(EmptySessionsSearchParams);
            setExistingParams(EmptySessionsSearchParams);
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
        <>
            <Modal
                title="Delete Segment"
                visible={deleteClicked}
                onCancel={() => setDeleteClicked(false)}
                style={{ display: 'flex' }}
            >
                <div className={styles.modalWrapper}>
                    <div className={styles.modalSubTitle}>
                        {`This action is irreversible. Do you want to delete ${
                            segmentToDelete?.name
                                ? `'${segmentToDelete.name}'`
                                : 'this segment'
                        }?`}
                    </div>
                    <button
                        className={commonStyles.submitButton}
                        onClick={() => {
                            deleteSegment({
                                variables: {
                                    segment_id:
                                        segmentToDelete?.id || NO_SEGMENT,
                                },
                            })
                                .then(() => {
                                    message.success('Deleted Segment!', 5);
                                    setDeleteClicked(false);
                                    setSegmentToDelete({});
                                    if (segment_id === segmentToDelete?.id) {
                                        history.push(
                                            `/${organization_id}/sessions`
                                        );
                                    }
                                })
                                .catch(() => {
                                    message.error('Error deleting segment!', 5);
                                });
                        }}
                    >
                        {loading ? (
                            <CircularSpinner
                                style={{ fontSize: 18, color: 'white' }}
                            />
                        ) : (
                            'Delete Segment'
                        )}
                    </button>
                    <button
                        className={commonStyles.secondaryButton}
                        onClick={() => setDeleteClicked(false)}
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
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
                                    state: EmptySessionsSearchParams,
                                }}
                                key={'sessions'}
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
                                        state: s?.params,
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
                                <button
                                    className={styles.segmentAction}
                                    onClick={() => {
                                        setDeleteClicked(true);
                                        setSegmentToDelete(s);
                                    }}
                                >
                                    <TrashIcon className={styles.trashIcon} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};
