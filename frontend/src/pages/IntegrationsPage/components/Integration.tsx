import Card from '@components/Card/Card';
import Modal from '@components/Modal/Modal';
import Switch from '@components/Switch/Switch';
import { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations';
import React, { useEffect, useState } from 'react';

import styles from './Integration.module.scss';

interface Props {
    integration: IntegrationType;
}

const Integration = ({
    integration: {
        icon,
        name,
        description,
        configurationPage,
        deleteConfirmationPage,
        defaultEnable,
    },
}: Props) => {
    const [showConfiguration, setShowConfiguration] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [integrationEnabled, setIntegrationEnabled] = useState(defaultEnable);

    useEffect(() => {
        setIntegrationEnabled(defaultEnable);
    }, [defaultEnable, setIntegrationEnabled]);

    return (
        <>
            <Card className={styles.integration} interactable>
                <div className={styles.header}>
                    <img src={icon} alt="" className={styles.logo} />
                    <Switch
                        trackingId={`IntegrationConnect-${name}`}
                        label={
                            !showConfiguration && integrationEnabled
                                ? 'Connected'
                                : 'Connect'
                        }
                        loading={
                            (showConfiguration && integrationEnabled) ||
                            (showDeleteConfirmation && !integrationEnabled)
                        }
                        size="default"
                        checked={integrationEnabled}
                        onChange={(newValue) => {
                            if (newValue) {
                                setShowConfiguration(true);
                            } else if (deleteConfirmationPage) {
                                setShowDeleteConfirmation(true);
                            }
                            setIntegrationEnabled(newValue);
                        }}
                    />
                </div>
                <div>
                    <h2 className={styles.title}>{name}</h2>
                    <p className={styles.description}>{description}</p>
                </div>
            </Card>

            <Modal
                visible={showConfiguration || showDeleteConfirmation}
                onCancel={() => {
                    if (showConfiguration) {
                        setShowConfiguration(false);
                        setIntegrationEnabled(false);
                    } else {
                        setShowDeleteConfirmation(false);
                        setIntegrationEnabled(true);
                    }
                }}
                title={`Configuring ${name} Integration`}
                destroyOnClose
                className={styles.modal}
            >
                {showConfiguration &&
                    configurationPage(
                        setShowConfiguration,
                        setIntegrationEnabled
                    )}
                {showDeleteConfirmation &&
                    deleteConfirmationPage &&
                    deleteConfirmationPage(
                        setShowDeleteConfirmation,
                        setIntegrationEnabled
                    )}
            </Modal>
        </>
    );
};

export default Integration;
