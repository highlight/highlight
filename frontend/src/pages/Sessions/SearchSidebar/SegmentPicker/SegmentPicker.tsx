import React, { useContext, useEffect, useState } from 'react';
import {
    Link,
    RouteComponentProps,
    useParams,
    withRouter,
} from 'react-router-dom';
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
import { message, Modal, Tooltip } from 'antd';
import { CircularSpinner } from '../../../../components/Loading/Loading';

export const LIVE_SEGMENT_ID = 'live';
const NO_SEGMENT = 'none';

const Picker: React.FC<RouteComponentProps> = ({ history }) => {
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
        refetchQueries: ['GetSegments'],
    });

    useEffect(() => {
        if (currentSegment) {
            const newParams: any = { ...currentSegment.params };
            const parsed: SearchParams = gqlSanitize(newParams);
            setSegmentName(currentSegment.name);
            setSearchParams(parsed);
            setExistingParams(parsed);
        } else {
            setSegmentName(null);
            const empty = {
                user_properties: [],
                identified: false,
            };
            setExistingParams(empty);
            setSearchParams(empty);
        }
    }, [currentSegment, setSegmentName, setSearchParams, setExistingParams]);

    return (
        <>
            <Modal
                visible={deleteClicked}
                maskClosable
                onCancel={() => setDeleteClicked(false)}
                style={{ display: 'flex' }}
                footer={null}
            >
                <div className={styles.modalWrapper}>
                    <div className={styles.modalTitle}>Delete Segment</div>
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
                </div>
            </Modal>
            <div className={styles.segmentPickerMenu}>
                {loading ? (
                    <div>
                        <Skeleton height={70} style={{ marginBottom: 8 }} />
                    </div>
                ) : (
                    <div className={styles.segmentPickerInner}>
                        <Link
                            to={`/${organization_id}/sessions`}
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
                            <div
                                className={styles.segmentItemWrapper}
                                key={s?.id}
                            >
                                <Link
                                    to={`/${organization_id}/sessions/segment/${s?.id}`}
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

export const SegmentPicker = withRouter(Picker);
