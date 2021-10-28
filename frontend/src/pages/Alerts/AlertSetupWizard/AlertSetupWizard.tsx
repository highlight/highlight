import Card from '@components/Card/Card';
import FullBleedCard from '@components/FullBleedCard/FullBleedCard';
import { ALERT_CONFIGURATIONS } from '@pages/Alerts/Alerts';
import { getAlertTypeColor } from '@pages/Alerts/utils/AlertsUtils';
import React from 'react';

import styles from './AlertSetupWizard.module.scss';

const AlertSetupHeader = () => {
    return (
        <div className={styles.alertStepsHeader}>
            <div className={styles.fullBleedAlertSetupStep}>
                Connect to slack
            </div>
            <div className={styles.fullBleedAlertSetupStep}>
                Select a channel
            </div>
            <div className={styles.fullBleedAlertSetupStep}>
                Select alert types
            </div>
        </div>
    );
};

const ConnectToSlackStep = () => {
    return <></>;
};

const SelectAChannelStep = () => {
    return <></>;
};

const SelectAlertTypesStep = () => {
    return (
        <div className={styles.cardGrid}>
            {Object.keys(ALERT_CONFIGURATIONS).map((_key) => {
                const key = _key as keyof typeof ALERT_CONFIGURATIONS;
                const configuration = ALERT_CONFIGURATIONS[key];
                const alertColor = getAlertTypeColor(configuration.name);

                return (
                    <div className={styles.cardContent} key={key}>
                        <Card interactable className={styles.cardContainer}>
                            <h2 id={styles.title}>
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
                    </div>
                );
            })}
        </div>
    );
};

const AlertSetupWizard = () => {
    return (
        <FullBleedCard
            className={styles.alertStepsParent}
            childrenClassName={styles.childContent}
        >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <AlertSetupHeader />
                <div>howdy</div>
                <ConnectToSlackStep />
                <SelectAChannelStep />
                <SelectAlertTypesStep />
            </div>
        </FullBleedCard>
    );
};

export default AlertSetupWizard;
