import React, { useContext, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ErrorSearchContext,
    ErrorSearchParams,
} from '../../ErrorSearchContext/ErrorSearchContext';
import { ReactComponent as CheckIcon } from '../../../../static/check.svg';
import Skeleton from 'react-loading-skeleton';

import styles from './SegmentPicker.module.scss';
import { useGetSegmentsQuery } from '../../../../graph/generated/hooks';

export const SegmentPicker = () => {
    const {
        setErrorSearchParams,
        setSegmentName,
        setExistingParams,
    } = useContext(ErrorSearchContext);
    const { segment_id, organization_id } = useParams<{
        segment_id: string;
        organization_id: string;
    }>();

    const { loading, data } = useGetSegmentsQuery({
        variables: { organization_id },
    });
    const currentSegment = data?.segments?.find((s) => s?.id === segment_id);

    useEffect(() => {
        if (currentSegment) {
            const newParams: any = { ...currentSegment.params };
            const parsed: ErrorSearchParams = sanitize(newParams);
            setSegmentName(currentSegment.name);
            setErrorSearchParams(parsed);
            setExistingParams(parsed);
        } else {
            setSegmentName(null);
            setExistingParams({});
            setErrorSearchParams({});
        }
    }, [
        currentSegment,
        setSegmentName,
        setErrorSearchParams,
        setExistingParams,
    ]);

    return (
        <div className={styles.segmentPickerMenu}>
            {loading ? (
                <div>
                    <Skeleton height={70} style={{ marginBottom: 8 }} />
                </div>
            ) : (
                <div className={styles.segmentPickerInner}>
                    <Link to={`/${organization_id}/errors`} key={'errors'}>
                        <div className={styles.segmentItem}>
                            <div className={styles.segmentText}>All Errors</div>
                            {!currentSegment && (
                                <CheckIcon className={styles.checkIcon} />
                            )}
                        </div>
                    </Link>
                    {data?.segments?.map((s) => (
                        <Link
                            to={`/${organization_id}/errors/segment/${s?.id}`}
                            key={s?.id}
                        >
                            <div className={styles.segmentItem}>
                                <div className={styles.segmentText}>
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

const sanitize = (object: any): any => {
    const omitTypename = (key: any, value: any) =>
        key === '__typename' ? undefined : value;
    const newPayload = JSON.parse(JSON.stringify(object), omitTypename);
    return newPayload;
};
