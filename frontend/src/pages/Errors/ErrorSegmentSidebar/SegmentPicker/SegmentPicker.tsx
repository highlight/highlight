import { message } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link, useHistory, useParams } from 'react-router-dom';

import commonStyles from '../../../../Common.module.scss';
import Button from '../../../../components/Button/Button/Button';
import { CircularSpinner } from '../../../../components/Loading/Loading';
import Modal from '../../../../components/Modal/Modal';
import {
    useDeleteErrorSegmentMutation,
    useGetErrorSegmentsQuery,
} from '../../../../graph/generated/hooks';
import { ReactComponent as CheckIcon } from '../../../../static/check.svg';
import { ReactComponent as TrashIcon } from '../../../../static/trash.svg';
import { gqlSanitize } from '../../../../util/gqlSanitize';
import {
    ErrorSearchParams,
    useErrorSearchContext,
} from '../../ErrorSearchContext/ErrorSearchContext';
import { EmptyErrorsSearchParams } from '../../ErrorsPage';
import styles from './SegmentPicker.module.scss';

const NO_SEGMENT = 'none';

export const ErrorSegmentPicker = () => {
    const {
        setSearchParams,
        setSegmentName,
        setExistingParams,
    } = useErrorSearchContext();
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
    const history = useHistory<ErrorSearchParams>();

    const [deleteClicked, setDeleteClicked] = useState(false);
    const [segmentToDelete, setSegmentToDelete] = useState<{
        name?: string;
        id?: string;
    } | null>();
    const [deleteSegment] = useDeleteErrorSegmentMutation({
        update(cache) {
            cache.modify({
                fields: {
                    error_segments(existingSegments, { readField }) {
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
            if (currentSegment) {
                if (
                    history.location.state &&
                    // history.location.state is empty when the user first loads the app and the route is deep-linked to a segment.
                    !_.isEqual(history.location.state, EmptyErrorsSearchParams)
                ) {
                    const parsed: ErrorSearchParams = gqlSanitize(
                        history.location.state
                    );
                    setSearchParams(parsed);
                    setExistingParams(parsed);
                } else {
                    const parsed: ErrorSearchParams = gqlSanitize({
                        ...currentSegment.params,
                    });
                    setSearchParams(parsed);
                    setExistingParams(parsed);
                }
                setSegmentName(currentSegment.name);
            } else {
                // Redirect home since the segment doesn't exist anymore.
                history.replace(`/${organization_id}/errors`);
            }
        } else {
            setSearchParams(EmptyErrorsSearchParams);
            setExistingParams(EmptyErrorsSearchParams);
        }
    }, [
        currentSegment,
        setSegmentName,
        setSearchParams,
        setExistingParams,
        history,
        organization_id,
        segment_id,
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
                    <Button
                        trackingId="DeleteErrorSegment"
                        type="primary"
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
                                            `/${organization_id}/errors`
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
                                style={{
                                    fontSize: 18,
                                    color: 'var(--text-primary-inverted)',
                                }}
                            />
                        ) : (
                            'Delete Segment'
                        )}
                    </Button>
                    <Button
                        trackingId="CancelDeleteErrorSegment"
                        className={commonStyles.secondaryButton}
                        onClick={() => setDeleteClicked(false)}
                    >
                        Cancel
                    </Button>
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
                                to={`/${organization_id}/errors`}
                                key={'errors'}
                            >
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
                                        <CheckIcon
                                            className={styles.checkIcon}
                                        />
                                    )}
                                </div>
                            </Link>
                        </div>
                        {data?.error_segments?.map((s) => (
                            <div
                                className={styles.segmentItemWrapper}
                                key={s?.id}
                            >
                                <Link
                                    to={`/${organization_id}/errors/segment/${s?.id}`}
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
