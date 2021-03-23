import React, { useContext, useEffect, useState } from 'react';
import {
    Link,
    RouteComponentProps,
    useParams,
    withRouter,
} from 'react-router-dom';
import {
    ErrorSearchContext,
    ErrorSearchParams,
} from '../../ErrorSearchContext/ErrorSearchContext';
import { ReactComponent as TrashIcon } from '../../../../static/trash.svg';
import { ReactComponent as CheckIcon } from '../../../../static/check.svg';
import Skeleton from 'react-loading-skeleton';

import commonStyles from '../../../../Common.module.scss';
import styles from './SegmentPicker.module.scss';
import {
    useDeleteErrorSegmentMutation,
    useGetErrorSegmentsQuery,
} from '../../../../graph/generated/hooks';
import { gqlSanitize } from '../../../../util/gqlSanitize';
import classNames from 'classnames';
import { message, Modal } from 'antd';
import { CircularSpinner } from '../../../../components/Loading/Loading';

const NO_SEGMENT = 'none';

const Picker: React.FC<RouteComponentProps> = ({ history }) => {
    const { setSearchParams, setSegmentName, setExistingParams } = useContext(
        ErrorSearchContext
    );
    const { segment_id, organization_id } = useParams<{
        segment_id: string;
        organization_id: string;
    }>();

    const { loading, data } = useGetErrorSegmentsQuery({
        variables: { organization_id },
    });
    const currentSegment = data?.error_segments?.find(
        (s) => s?.id === segment_id
    );

    const [deleteClicked, setDeleteClicked] = useState(false);
    const [segmentToDelete, setSegmentToDelete] = useState<{
        name?: string;
        id?: string;
    } | null>();
    const [deleteSegment] = useDeleteErrorSegmentMutation({
        refetchQueries: ['GetSegments'],
    });

    useEffect(() => {
        if (currentSegment) {
            const newParams: any = { ...currentSegment.params };
            const parsed: ErrorSearchParams = gqlSanitize(newParams);
            setSegmentName(currentSegment.name);
            setSearchParams(parsed);
            setExistingParams(parsed);
        } else {
            setSegmentName(null);
            setExistingParams({});
            setSearchParams({});
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
                                    history.push(`/${organization_id}/errors`);
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
                        <Link to={`/${organization_id}/errors`} key={'errors'}>
                            <div className={styles.segmentItem}>
                                <div
                                    className={classNames(
                                        styles.segmentText,
                                        currentSegment &&
                                            styles.segmentUnselected
                                    )}
                                >
                                    All Errors
                                </div>
                                {!currentSegment && (
                                    <CheckIcon className={styles.checkIcon} />
                                )}
                            </div>
                        </Link>
                        {data?.error_segments?.map((s) => (
                            <Link
                                to={`/${organization_id}/errors/segment/${s?.id}`}
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
                                        <CheckIcon
                                            className={styles.checkIcon}
                                        />
                                    )}
                                    <button
                                        className={styles.segmentAction}
                                        onClick={() => {
                                            setDeleteClicked(true);
                                            setSegmentToDelete(s);
                                        }}
                                    >
                                        <TrashIcon
                                            className={styles.trashIcon}
                                        />
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export const ErrorSegmentPicker = withRouter(Picker);
