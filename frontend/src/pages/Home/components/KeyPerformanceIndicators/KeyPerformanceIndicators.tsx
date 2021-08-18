import { message } from 'antd';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { useGetKeyPerformanceIndicatorsQuery } from '../../../../graph/generated/hooks';
import { EmptySessionsSearchParams } from '../../../Sessions/EmptySessionsSearchParams';
import { useSearchContext } from '../../../Sessions/SearchContext/SearchContext';
import { useHomePageFiltersContext } from '../HomePageFilters/HomePageFiltersContext';
import KeyPerformanceIndicator from './KeyPerformanceIndicator/KeyPerformanceIndicator';
import styles from './KeyPerformanceIndicators.module.scss';
import { formatLongNumber, formatShortTime } from './utils/utils';

const KeyPerformanceIndicators = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { dateRangeLength } = useHomePageFiltersContext();
    const {
        setSearchParams,
        setSegmentName,
        setSelectedSegment,
    } = useSearchContext();
    const { loading, data } = useGetKeyPerformanceIndicatorsQuery({
        variables: { organization_id, lookBackPeriod: dateRangeLength },
    });

    return (
        <div className={styles.keyPerformanceIndicatorsContainer}>
            {loading ? (
                <Skeleton count={1} style={{ width: 473.812, height: 64 }} />
            ) : (
                <>
                    <KeyPerformanceIndicator
                        value={formatLongNumber(
                            data?.newUsersCount?.count || 0
                        )}
                        title="New Users"
                        route={`/${organization_id}/sessions`}
                        onClick={() => {
                            message.success('Showing sessions for new users');
                            setSegmentName(null);
                            setSelectedSegment(undefined);
                            setSearchParams({
                                ...EmptySessionsSearchParams,
                                first_time: true,
                            });
                        }}
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
                        tooltipText={
                            <>Users that are currently using your app.</>
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
