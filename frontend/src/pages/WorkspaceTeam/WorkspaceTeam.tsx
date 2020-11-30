import React, { useEffect, useRef, useContext } from 'react';
import { message } from 'antd';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Avatar } from '../../components/Avatar/Avatar';
import { CircularSpinner } from '../../components/Spinner/Spinner';
import classNames from 'classnames/bind';

import commonStyles from '../../Common.module.css';
import styles from './WorkspaceTeam.module.css';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';

type Inputs = {
    email: string;
};

export const WorkspaceTeam = () => {
    const { organization_id } = useParams();
    const emailRef = useRef<null | HTMLInputElement>(null);
    const { register, handleSubmit, errors, reset } = useForm<Inputs>();
    const { data: orgData } = useQuery<
        { organization: { name: string } },
        { id: number }
    >(
        gql`
            query GetOrganization($id: ID!) {
                organization(id: $id) {
                    name
                }
            }
        `,
        { variables: { id: organization_id } }
    );
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

    const { setOpenSidebar } = useContext(SidebarContext);

    useEffect(() => {
        setOpenSidebar(true);
    }, [setOpenSidebar]);

    useEffect(() => {
        reset();
    }, [reset]);

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
            emailRef.current?.focus();
        });
    };

    if (error) {
        return <div>{JSON.stringify(error)}</div>;
    }

    return (
        <div className={styles.teamPageWrapper}>
            <div className={styles.blankSidebar}></div>
            <div className={styles.teamPage}>
                <div className={styles.title}>Invite A Member</div>
                <div className={styles.subTitle}>
                    Invite a your team to your Workspace.
                </div>
                <div className={styles.box}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.boxTitle}>Invite Your Team</div>
                        <div className={styles.boxSubTitle}>
                            Invite a team member to '
                            {`${orgData?.organization.name}`}' by entering an
                            email below.
                        </div>
                        <div className={styles.buttonRow}>
                            <input
                                className={commonStyles.input}
                                placeholder={'Email'}
                                type="email"
                                name="email"
                                ref={(e) => {
                                    register(e, { required: true });
                                    emailRef.current = e;
                                }}
                            />
                            <button
                                className={classNames(
                                    commonStyles.submitButton,
                                    styles.inviteButton
                                )}
                            >
                                {sendLoading ? (
                                    <CircularSpinner
                                        style={{ fontSize: 18, color: 'white' }}
                                    />
                                ) : (
                                    'Invite'
                                )}
                            </button>
                        </div>
                        <div className={commonStyles.errorMessage}>
                            {errors.email &&
                                'Error validating email ' +
                                    errors.email.message}
                        </div>
                    </form>
                </div>
                <div className={styles.box}>
                    <div className={styles.title}>Members</div>
                    {data?.admins.map((a) => {
                        return (
                            <div key={a.id} className={styles.memberCard}>
                                <Avatar
                                    seed={a.id.toString()}
                                    style={{
                                        height: 45,
                                        width: 45,
                                        marginLeft: 5,
                                        marginRight: 5,
                                    }}
                                />
                                <div className={styles.userDetails}>
                                    <div className={styles.name}>{a.name}</div>
                                    <div className={styles.email}>
                                        {a.email}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
