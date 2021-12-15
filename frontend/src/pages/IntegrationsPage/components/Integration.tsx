import Button from '@components/Button/Button/Button';
import Card from '@components/Card/Card';
import Modal from '@components/Modal/Modal';
import Switch from '@components/Switch/Switch';
import { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations';
import React, { useState } from 'react';

import styles from './Integration.module.scss';

interface Props {
    integration: IntegrationType;
}

const Integration = ({
    integration: { icon, name, description, configurationPage },
}: Props) => {
    const [showConfiguration, setShowConfiguration] = useState(false);
    const [integrationEnabled, setIntegrationEnabled] = useState(false);

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
                        loading={showConfiguration && integrationEnabled}
                        size="default"
                        checked={integrationEnabled}
                        onChange={(newValue) => {
                            if (newValue) {
                                setShowConfiguration(true);
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
                visible={showConfiguration}
                onCancel={() => {
                    setShowConfiguration(false);
                    setIntegrationEnabled(false);
                }}
                title={`Configuring ${name} Integration`}
                destroyOnClose
                className={styles.modal}
            >
                {configurationPage}
                <footer>
                    <Button
                        trackingId={`IntegrationConfigurationCancel-${name}`}
                        onClick={() => {
                            setShowConfiguration(false);
                            setIntegrationEnabled(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        trackingId={`IntegrationConfigurationSave-${name}`}
                        type="primary"
                        onClick={() => {
                            setShowConfiguration(false);
                        }}
                    >
                        Save
                    </Button>
                </footer>
            </Modal>
        </>
    );
};

export default Integration;
