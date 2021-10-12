import Card from '@components/Card/Card';
import { ALERT_CONFIGURATIONS } from '@pages/Alerts/Alerts';
import { getAlertTypeColor } from '@pages/Alerts/utils/AlertsUtils';
import { useParams } from '@util/react-router/useParams';
import { snakeCaseString } from '@util/string';
import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import styles from './NewAlertPage.module.scss';

const NewAlertPage = () => {
    const { url } = useRouteMatch();
    const { type } = useParams<{ type?: string }>();

    return (
        <div>
            <p className={layoutStyles.subTitle}>
                👋 Let's create an alert! Alerts are a way to keep your team in
                the loop as to what is happening on your app.
            </p>

            {!type && (
                <div className={styles.cardGrid}>
                    {Object.keys(ALERT_CONFIGURATIONS).map((_key) => {
                        const key = _key as keyof typeof ALERT_CONFIGURATIONS;
                        const configuration = ALERT_CONFIGURATIONS[key];
                        const alertColor = getAlertTypeColor(
                            configuration.name
                        );

                        return (
                            <Link
                                className={styles.cardContent}
                                key={key}
                                to={{
                                    pathname: `${url}/${snakeCaseString(
                                        configuration.name
                                    )}`,
                                    state: {
                                        errorName: `${configuration.name} Alert`,
                                    },
                                }}
                            >
                                <Card
                                    interactable
                                    className={styles.cardContainer}
                                >
                                    <h2 className={styles.title}>
                                        <span
                                            className={styles.icon}
                                            style={{
                                                backgroundColor: alertColor,
                                            }}
                                        >
                                            {ALERT_CONFIGURATIONS[key].icon}
                                        </span>
                                        {ALERT_CONFIGURATIONS[key].name}
                                    </h2>
                                    <p className={styles.description}>
                                        {ALERT_CONFIGURATIONS[key].description}
                                    </p>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NewAlertPage;
