import { useGetWebVitalsQuery } from '@graph/hooks';
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/Toolbar/DevToolsWindow/MetricsPage/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
import React from 'react';
import Skeleton from 'react-loading-skeleton';

import styles from './MetricsPage.module.scss';

const MetricsPage = React.memo(() => {
    const { session_secure_id } = useParams<{ session_secure_id: string }>();
    const { data, loading } = useGetWebVitalsQuery({
        variables: {
            session_secure_id,
        },
    });
    console.log(data);

    return (
        <div className={styles.wrapper}>
            <div>
                {loading ? (
                    <Skeleton />
                ) : (
                    data?.web_vitals.map(({ name, value }) => {
                        console.log(WEB_VITALS_CONFIGURATION);
                        const configuration = WEB_VITALS_CONFIGURATION[name];

                        return (
                            <div key={name}>
                                <h3>{configuration.name}</h3>
                                <p>
                                    {value} {configuration.units}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
});

export default MetricsPage;
