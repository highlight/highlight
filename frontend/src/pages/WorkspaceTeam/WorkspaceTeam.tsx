import Card from '@components/Card/Card';
import Modal from '@components/Modal/Modal';
import Table from '@components/Table/Table';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import classNames from 'classnames/bind';
import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { useToggle } from 'react-use';

import { useAuthContext } from '../../authentication/AuthContext';
import commonStyles from '../../Common.module.scss';
import { AdminAvatar } from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button/Button';
import CopyText from '../../components/CopyText/CopyText';
import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import { CircularSpinner } from '../../components/Loading/Loading';
import PopConfirm from '../../components/PopConfirm/PopConfirm';
import {
    useDeleteAdminFromWorkspaceMutation,
    useGetWorkspaceAdminsQuery,
    useSendAdminWorkspaceInviteMutation,
} from '../../graph/generated/hooks';
import { getWorkspaceInvitationLink } from './utils';
import styles from './WorkspaceTeam.module.scss';

type Inputs = {
    email: string;
};

const WorkspaceTeam = () => {
    const { workspace_id } = useParams<{ workspace_id: string }>();
    const emailRef = useRef<null | HTMLInputElement>(null);
    const { register, handleSubmit, errors, reset } = useForm<Inputs>();
    const { data, error, loading } = useGetWorkspaceAdminsQuery({
        variables: { workspace_id },
    });
    const [showModal, toggleShowModal] = useToggle(false);

    const { admin } = useAuthContext();
    const [deleteAdminFromWorkspace] = useDeleteAdminFromWorkspaceMutation({
        update(cache, { data }) {
            cache.modify({
                fields: {
                    workspace_admins(existingAdmins, { readField }) {
                        if (data?.deleteAdminFromWorkspace !== undefined) {
                            message.success('Removed member');
                            return existingAdmins.filter(
                                (admin: any) =>
                                    data.deleteAdminFromWorkspace !==
                                    readField('id', admin)
                            );
                        }
                        message.success('Failed to remove member');
                        return existingAdmins;
                    },
                },
            });
        },
    });

    const [
        sendInviteEmail,
        { loading: sendLoading },
    ] = useSendAdminWorkspaceInviteMutation();

    useEffect(() => {
        reset();
    }, [reset]);

    const onSubmit = (data: Inputs) => {
        sendInviteEmail({
            variables: {
                workspace_id,
                email: data.email,
                base_url: window.location.origin,
            },
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
        <LeadAlignLayout>
            <Helmet>
                <title>Workspace Team</title>
            </Helmet>
            <h2>Invite A Member</h2>
            <div className={styles.subTitleContainer}>
                <p className={layoutStyles.subTitle} id={styles.subTitle}>
                    Invite your team to your Workspace.
                </p>
                <Modal
                    destroyOnClose
                    centered
                    title="Invite Member"
                    visible={showModal}
                    width={600}
                    onCancel={toggleShowModal}
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <p className={styles.boxSubTitle}>
                            Invite a team member to '
                            {`${data?.workspace?.name}`}' by entering an email
                            below.
                        </p>
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
                            <Button
                                trackingId="WorkspaceInviteMember"
                                type="primary"
                                className={classNames(
                                    commonStyles.submitButton,
                                    styles.inviteButton
                                )}
                                htmlType="submit"
                            >
                                {sendLoading ? (
                                    <CircularSpinner
                                        style={{
                                            fontSize: 18,
                                            color:
                                                'var(--text-primary-inverted)',
                                        }}
                                    />
                                ) : (
                                    'Invite'
                                )}
                            </Button>
                        </div>
                        <div className={commonStyles.errorMessage}>
                            {errors.email &&
                                'Error validating email ' +
                                    errors.email.message}
                        </div>
                    </form>
                    <hr className={styles.hr} />
                    <p>Or share this link with them.</p>
                    <CopyText
                        text={getWorkspaceInvitationLink(
                            data?.workspace?.secret || '',
                            workspace_id
                        )}
                    />
                </Modal>
                <Button
                    trackingId="WorkspaceTeamInviteMember"
                    type="primary"
                    onClick={toggleShowModal}
                >
                    Invite Member
                </Button>
            </div>

            <Card noPadding>
                <Table
                    columns={TABLE_COLUMNS}
                    loading={loading}
                    dataSource={data?.admins?.map((member) => ({
                        name: member?.name,
                        email: member?.email,
                        role: member?.role,
                        photoUrl: member?.photo_url,
                        id: member?.id,
                        isSameAdmin: member?.id === admin?.id,
                        onDeleteHandler: () =>
                            deleteAdminFromWorkspace({
                                variables: {
                                    admin_id: member!.id,
                                    workspace_id,
                                },
                            }),
                    }))}
                    pagination={false}
                    showHeader={false}
                    rowHasPadding
                />
            </Card>
        </LeadAlignLayout>
    );
};

export default WorkspaceTeam;

const TABLE_COLUMNS = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (_: string, record: any) => {
            return (
                <div className={styles.memberCard}>
                    <AdminAvatar
                        size={45}
                        adminInfo={{
                            email: record.email,
                            name: record.name,
                            photo_url: record.photoUrl,
                        }}
                    />
                    <div>
                        <h4>
                            {record?.name
                                ? record?.name
                                : record?.email.split('@')[0]}
                        </h4>
                        <div className={styles.email}>{record?.email}</div>
                    </div>
                </div>
            );
        },
    },
    //     {
    //         title: 'Role',
    //         dataIndex: 'role',
    //         key: 'role',
    //         render: (role: string) => {
    //             return <div className={styles.role}>{role}</div>;
    //         },
    //     },
    {
        title: 'Remove',
        dataIndex: 'remove',
        key: 'remove',
        render: (_: any, record: any) => {
            if (record.isSameAdmin) {
                return null;
            }

            return (
                <PopConfirm
                    title={`Remove ${record?.name || record?.email}?`}
                    description={`They will no longer have access to Highlight. You can invite them again if they need access.`}
                    okText={`Remove ${record?.name || record?.email}`}
                    cancelText="Cancel"
                    onConfirm={() => {
                        if (record?.onDeleteHandler) {
                            record.onDeleteHandler();
                        }
                    }}
                    okButtonProps={{ danger: true }}
                >
                    <Button
                        className={styles.removeTeamMemberButton}
                        trackingId="RemoveTeamMember"
                        // An Admin should not be able to delete themselves from an project.
                        disabled={record?.isSameAdmin}
                        type="primary"
                        danger
                    >
                        Remove from Workspace
                    </Button>
                </PopConfirm>
            );
        },
    },
];
