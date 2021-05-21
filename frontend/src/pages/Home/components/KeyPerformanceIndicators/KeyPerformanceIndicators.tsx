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
                <Skeleton count={1} style={{ width: 373.422, height: 64 }} />
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
                        tooltipText={
                            <>
                                New users for your app that have an identity.
                                <br />
                                Click to see the sessions.
                            </>
                        }
                    />
                    <KeyPerformanceIndicator
                        value={formatLongNumber(
                            data?.userFingerprintCount?.count || 0
                        )}
                        title="Devices"
                        tooltipText="Devices that have used your application that don't have an identity associated with the device."
                    />
                    <KeyPerformanceIndicator
                        value={formatLongNumber(
                            data?.unprocessedSessionsCount || 0
                        )}
                        title="Live Users"
                        route={`/${organization_id}/sessions/segment/${LIVE_SEGMENT_ID}`}
                        tooltipText={
                            <>
                                Users that are currently using your app.
                                <br />
                                Click to see the sessions.
                            </>
                        }
                    />
                    <KeyPerformanceIndicator
                        value={
                            formatShortTime(
                                (data?.averageSessionLength?.length || 0) / 1000
                            ).toString() || ''
                        }
                        title="Average Active Time"
                        tooltipText="The time spent by your users on your app across all sessions."
                    />
                </>
            )}
        </div>
    );
};

export default KeyPerformanceIndicators;
