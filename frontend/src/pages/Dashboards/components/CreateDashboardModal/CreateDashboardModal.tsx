import Button from '@components/Button/Button/Button';
import Input from '@components/Input/Input';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import alertStyles from '@pages/Alerts/Alerts.module.scss';
import { useDashboardsContext } from '@pages/Dashboards/DashboardsContext/DashboardsContext';
import { DEFAULT_METRICS_LAYOUT } from '@pages/Dashboards/Metrics';
import { useParams } from '@util/react-router/useParams';
import { H } from 'highlight.run';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import dashStyles from '../../pages/Dashboard/DashboardPage.module.scss';
import styles from './CreateDashboardModal.module.scss';

const CreateDashboardModal = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const history = useHistory();
    const { updateDashboard } = useDashboardsContext();
    const [showModal, setShowModal] = useState(false);
    const [newDashboard, setNewDashboard] = useState<string>('');

    const onCreateNewDashboard = () => {
        if (!newDashboard) return;
        updateDashboard({
            name: newDashboard,
            metrics: [],
            layout: JSON.stringify(DEFAULT_METRICS_LAYOUT),
        }).then((r) => {
            const newId = r.data?.upsertDashboard || '';
            history.push(`/${project_id}/dashboards/${newId}`);
        });
    };

    return (
        <>
            <Modal
                onCancel={() => {
                    setShowModal(false);
                }}
                visible={showModal}
                title={'Create a New Dashboard'}
                width="800px"
            >
                <ModalBody>
                    <section className={dashStyles.section}>
                        <h3
                            style={{
                                fontWeight: 'normal',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                            className={styles.name}
                        >
                            What do you want to call it?
                        </h3>
                        <div className={styles.name}>
                            <Input
                                placeholder="Name"
                                name="Dashboard Name"
                                value={newDashboard}
                                onChange={(e) => {
                                    const val = e.target?.value || '';
                                    setNewDashboard(val);
                                }}
                                autoFocus
                            />
                        </div>
                    </section>
                    <div className={styles.actionsContainer}>
                        <Button
                            trackingId="CreateDashboardModalCancelButton"
                            onClick={() => {
                                setShowModal(false);
                            }}
                            type="default"
                            className={styles.button}
                        >
                            Cancel
                        </Button>
                        <Button
                            trackingId="CreateDashboardModalConfirmButton"
                            onClick={onCreateNewDashboard}
                            type="primary"
                            className={styles.button}
                        >
                            Create
                        </Button>
                    </div>
                </ModalBody>
            </Modal>
            <Button
                trackingId={'NewDashboard'}
                className={alertStyles.callToAction}
                onClick={() => {
                    setShowModal(true);
                    H.track(`CreateDashboardModal-Open`);
                }}
            >
                New Dashboard
            </Button>
        </>
    );
};

export default CreateDashboardModal;
