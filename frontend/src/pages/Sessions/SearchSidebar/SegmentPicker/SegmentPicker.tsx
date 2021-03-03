import React, { useContext, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SearchContext, SearchParams } from '../../SearchContext/SearchContext';
import { ReactComponent as CheckIcon } from '../../../../static/check.svg';
import Skeleton from 'react-loading-skeleton';

import styles from './SegmentPicker.module.scss';
import { useGetSegmentsQuery } from '../../../../graph/generated/hooks';
import { gqlSanitize } from '../../../../util/gqlSanitize';
import classNames from 'classnames';

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
    const currentSegment = data?.segments?.find((s) => s?.id === segment_id);

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
            setExistingParams({ ...empty });
            setSearchParams({ ...empty });
        }
    }, [currentSegment, setSegmentName, setSearchParams, setExistingParams]);

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
                                    currentSegment && styles.segmentUnselected
                                )}
                            >
                                All Sessions
                            </div>
                            {!currentSegment && (
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
