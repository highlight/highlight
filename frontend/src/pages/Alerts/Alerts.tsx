import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import { useGetAlertsPagePayloadQuery } from '../../graph/generated/hooks';
import { AlertConfigurationCard } from './AlertConfigurationCard/AlertConfigurationCard';
import styles from './Alerts.module.scss';

const AlertsPage = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data, loading } = useGetAlertsPagePayloadQuery({
        variables: { organization_id: organization_id },
    });

    const ALERT_CONFIGURATIONS = [
        {
            name: 'Error Alerts',
            canControlThreshold: true,
        },
        {
            name: 'Session Alerts',
            canControlThreshold: false,
        },
        {
            name: 'First Time User Alerts',
            canControlThreshold: true,
        },
        {
            name: 'Track Event Alerts',
            canControlThreshold: false,
        },
    ];

    return (
        <LeadAlignLayout>
            <h2>Configure your alerts</h2>
            <p className={layoutStyles.subTitle}>
                Configure the environments you want alerts for.
            </p>

            <div className={styles.configurationContainer}>
                {loading ? (
                    Array(3)
                        .fill(0)
                        .map((_, index) => (
                            <Skeleton
                                key={index}
                                style={{
                                    width: '100%',
                                    height: 79,
                                    borderRadius: 8,
                                }}
                            />
                        ))
                ) : (
                    <>
                        {/* {ALERT_CONFIGURATIONS.map((configuration) => (
                            <AlertConfigurationCard
                                key={configuration.name}
                                configuration={configuration}
                                environmentOptions={
                                    data?.environment_suggestion || []
                                }
                                channelSuggestions={
                                    data?.slack_channel_suggestion || []
                                }
                            />
                        ))} */}
                        <AlertConfigurationCard
                            configuration={ALERT_CONFIGURATIONS[0]}
                            alert={
                                data?.error_alerts ? data?.error_alerts[0] : {}
                            }
                            environmentOptions={
                                data?.environment_suggestion || []
                            }
                            channelSuggestions={
                                data?.slack_channel_suggestion || []
                            }
                        />
                    </>
                )}
            </div>
        </LeadAlignLayout>
    );
};

export default AlertsPage;
