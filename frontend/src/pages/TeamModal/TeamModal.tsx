import React, { useState } from 'react';
import { Modal } from 'antd';
import { Link } from 'react-router-dom';
import appStyles from '../../App.module.css';
import styles from './TeamModal.module.css';
import commonStyles from '../../Common.module.css';
import { useForm } from 'react-hook-form';

type Inputs = {
    email: string;
    password: string;
};

export const TeamModal = () => {
    const [showModal, setShowModal] = useState(false);
    const { watch, register, handleSubmit, errors, reset, setError } = useForm<
        Inputs
    >();

    return (
        <>
            <Link
                onClick={() => {
                    setShowModal(true);
                }}
                to={'#'}
                className={appStyles.headerLink}
            >
                Team
            </Link>
            <Modal
                visible={true}
                footer={null}
                onCancel={() => setShowModal(false)}
                width={745}
            >
                <div className={styles.teamModal}>
                    <div className={styles.membersSection}>
                        <div className={styles.title}>Add A Member</div>
                        <input
                            className={commonStyles.input}
                            placeholder={'Email'}
                            ref={register({
                                required: true,
                            })}
                        />
                        <button className={commonStyles.submitButton}>
                            Send Invite
                        </button>
                    </div>
                    <div className={styles.membersSection}>
                        <div className={styles.title}>Members</div>
                    </div>
                </div>
            </Modal>
        </>
    );
};
