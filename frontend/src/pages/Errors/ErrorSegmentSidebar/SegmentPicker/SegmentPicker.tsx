import React, { useContext, useEffect } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import {
    ErrorSearchContext,
    ErrorSearchParams,
} from '../../ErrorSearchContext/ErrorSearchContext';
import { ReactComponent as CheckIcon } from '../../../../static/check.svg';
import Skeleton from 'react-loading-skeleton';

import styles from './SegmentPicker.module.scss';
import { useGetErrorSegmentsQuery } from '../../../../graph/generated/hooks';
import { gqlSanitize } from '../../../../util/gqlSanitize';
import classNames from 'classnames';
import _ from 'lodash';
import { EmptyErrorsSearchParams } from '../../ErrorsPage';

export const ErrorSegmentPicker = () => {
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
    const history = useHistory<ErrorSearchParams>();

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
        <div className={styles.segmentPickerMenu}>
            {loading ? (
                <div>
                    <Skeleton height={70} style={{ marginBottom: 8 }} />
                </div>
            ) : (
                <div className={styles.segmentPickerInner}>
                    <Link
                        to={{
                            pathname: `/${organization_id}/errors`,
                            state: EmptyErrorsSearchParams,
                        }}
                        key={'errors'}
                    >
                        <div className={styles.segmentItem}>
                            <div
                                className={classNames(
                                    styles.segmentText,
                                    currentSegment && styles.segmentUnselected
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
                            to={{
                                pathname: `/${organization_id}/errors/segment/${s?.id}`,
                                state: s?.params,
                            }}
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
