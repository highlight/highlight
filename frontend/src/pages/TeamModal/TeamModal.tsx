import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Avatar } from '../../components/Avatar/Avatar';
import { CircularSpinner } from '../../components/Spinner/Spinner';

import appStyles from '../../App.module.css';
import commonStyles from '../../Common.module.css';
import styles from './TeamModal.module.css';

type Inputs = {
    email: string;
};

export const TeamModal = () => {
    const { organization_id } = useParams();
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, errors, reset } = useForm<Inputs>();
    const { data, error } = useQuery<
        { admins: { id: number; name: string; email: string }[] },
        { organization_id: number }
    >(
        gql`
            query GetAdmins($organization_id: ID!) {
                admins(organization_id: $organization_id) {
                    id
                    name
                    email
                }
            }
        `,
        { variables: { organization_id } }
    );

    const [sendInviteEmail, { loading: sendLoading }] = useMutation<
        { email: string },
        { organization_id: number; email: string }
    >(
        gql`
            mutation SendAdminInvite($organization_id: ID!, $email: String!) {
                sendAdminInvite(
                    organization_id: $organization_id
                    email: $email
                )
            }
        `
    );

    const onSubmit = (data: Inputs) => {
        sendInviteEmail({
            variables: { organization_id, email: data.email },
        }).then(() => {
            message.success(`Invite email sent to ${data.email}!`, 5);
            reset();
        });
    };

    if (error) {
        return <div>{JSON.stringify(error)}</div>;
    }

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
                visible={showModal}
                footer={null}
                onCancel={() => setShowModal(false)}
                width={745}
            >
                <div className={styles.teamModal}>
                    <div className={styles.inviteSection}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className={styles.title}>Invite A Member</div>
                            <div className={styles.subTitle}>
                                Invite a team member to this workspace by
                                entering an email below.
                            </div>
                            <input
                                className={commonStyles.input}
                                placeholder={'Email'}
                                type="email"
                                name="email"
                                ref={register({
                                    required: true,
                                })}
                            />
                            <div className={commonStyles.errorMessage}>
                                {errors.email &&
                                    'Error validating email ' +
                                        errors.email.message}
                            </div>
                            <button className={commonStyles.submitButton}>
                                {sendLoading ? (
                                    <CircularSpinner
                                        style={{ fontSize: 18, color: 'white' }}
                                    />
                                ) : (
                                    'Send Invite'
                                )}
                            </button>
                        </form>
                    </div>
                    <div className={styles.membersSection}>
                        <div className={styles.title}>Members</div>
                        {data?.admins.map((a) => {
                            return (
                                <div className={styles.memberCard}>
                                    <Avatar
                                        style={{
                                            height: 45,
                                            width: 45,
                                            marginLeft: 5,
                                            marginRight: 5,
                                        }}
                                    />
                                    <div className={styles.userDetails}>
                                        <div className={styles.name}>
                                            {a.name}
                                        </div>
                                        <div className={styles.email}>
                                            {a.email}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </>
    );
};
