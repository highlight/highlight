import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { useGetKeyPerformanceIndicatorsQuery } from '../../../../graph/generated/hooks';
import KeyPerformanceIndicator from './KeyPerformanceIndicator/KeyPerformanceIndicator';
import styles from './KeyPerformanceIndicators.module.scss';

const KeyPerformanceIndicators = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { loading, data } = useGetKeyPerformanceIndicatorsQuery({
        variables: { organization_id },
    });

    return (
        <div className={styles.keyPerformanceIndicatorsContainer}>
            {loading ? (
                <Skeleton count={1} style={{ width: '100%', height: 300 }} />
            ) : (
                <>
                    <KeyPerformanceIndicator value="5.2k" title="New Users" />
                    <KeyPerformanceIndicator
                        value={data?.unprocessedSessionsCount}
                        title="Live Users"
                    />
                    <KeyPerformanceIndicator
                        value="8.4s"
                        title="Average Active Time"
                    />
                </>
            )}
        </div>
    );
};

export default KeyPerformanceIndicators;
