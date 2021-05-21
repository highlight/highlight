import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { useGetKeyPerformanceIndicatorsQuery } from '../../../../graph/generated/hooks';
import { SessionPageSearchParams } from '../../../Player/utils/utils';
import { LIVE_SEGMENT_ID } from '../../../Sessions/SearchSidebar/SegmentPicker/SegmentPicker';
import { useHomePageFiltersContext } from '../HomePageFilters/HomePageFiltersContext';
import KeyPerformanceIndicator from './KeyPerformanceIndicator/KeyPerformanceIndicator';
import styles from './KeyPerformanceIndicators.module.scss';
import { formatLongNumber, formatShortTime } from './utils/utils';

const KeyPerformanceIndicators = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { dateRangeLength } = useHomePageFiltersContext();
    const { loading, data } = useGetKeyPerformanceIndicatorsQuery({
        variables: { organization_id, lookBackPeriod: dateRangeLength },
    });

    return (
        <div className={styles.keyPerformanceIndicatorsContainer}>
            {loading ? (
                <Skeleton count={1} style={{ width: 300, height: 68.39 }} />
            ) : (
                <>
                    <KeyPerformanceIndicator
                        value={formatLongNumber(
                            data?.newUsersCount?.count || 0
                        )}
                        title="New Users"
                        route={`/${organization_id}/sessions?${new URLSearchParams(
                            { [SessionPageSearchParams.firstTimeUsers]: 'true' }
                        ).toString()}`}
                    />
                    <KeyPerformanceIndicator
                        value={formatLongNumber(
                            data?.unprocessedSessionsCount || 0
                        )}
                        title="Live Users"
                        route={`/${organization_id}/sessions/segment/${LIVE_SEGMENT_ID}`}
                    />
                    <KeyPerformanceIndicator
                        value={
                            formatShortTime(
                                (data?.averageSessionLength?.length || 0) / 1000
                            ).toString() || ''
                        }
                        title="Average Active Time"
                    />
                </>
            )}
        </div>
    );
};

export default KeyPerformanceIndicators;
