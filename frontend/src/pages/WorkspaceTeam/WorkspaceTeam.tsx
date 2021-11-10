import Alert from '@components/Alert/Alert';
import Card from '@components/Card/Card';
import CopyText from '@components/CopyText/CopyText';
import Input from '@components/Input/Input';
import Modal from '@components/Modal/Modal';
import Table from '@components/Table/Table';
import SvgTrash from '@icons/Trash';
import { getWorkspaceInvitationLink } from '@pages/WorkspaceTeam/utils';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import classNames from 'classnames/bind';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useToggle } from 'react-use';

import { useAuthContext } from '../../authentication/AuthContext';
import commonStyles from '../../Common.module.scss';
import { AdminAvatar } from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button/Button';
import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import { CircularSpinner } from '../../components/Loading/Loading';
import PopConfirm from '../../components/PopConfirm/PopConfirm';
import {
    useDeleteAdminFromWorkspaceMutation,
    useGetWorkspaceAdminsQuery,
    useSendAdminWorkspaceInviteMutation,
} from '../../graph/generated/hooks';
import styles from './WorkspaceTeam.module.scss';

const WorkspaceTeam = () => {
    const { workspace_id } = useParams<{ workspace_id: string }>();
    const emailRef = useRef<null | HTMLInputElement>(null);
    const { data, error, loading } = useGetWorkspaceAdminsQuery({
        variables: { workspace_id },
    });
    const [email, setEmail] = useState('');
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
        { loading: sendLoading, data: sendInviteEmailData },
    ] = useSendAdminWorkspaceInviteMutation();

    const onSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        sendInviteEmail({
            variables: {
                workspace_id,
                email,
                base_url: window.location.origin,
            },
        }).then(() => {
            message.success(`Invite email sent to ${email}!`, 5);
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
            <div className={styles.titleContainer}>
                <div>
                    <h2>Invite A Member</h2>
                    <p className={layoutStyles.subTitle} id={styles.subTitle}>
                        Invite your team to your Workspace.
                    </p>
                </div>
                <Modal
                    destroyOnClose
                    centered
                    title="Invite Member"
                    visible={showModal}
                    width={600}
                    onCancel={toggleShowModal}
                >
                    <form onSubmit={onSubmit}>
                        <p className={styles.boxSubTitle}>
                            Invite a team member to '
                            {`${data?.workspace?.name}`}' by entering an email
                            below.
                        </p>
                        <div className={styles.buttonRow}>
                            <Input
                                className={styles.emailInput}
                                placeholder={'Email'}
                                type="email"
                                name="email"
                                autoFocus
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
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
                    </form>
                    {sendInviteEmailData?.sendAdminWorkspaceInvite && (
                        <Alert
                            shouldAlwaysShow
                            trackingId="InviteAdminToWorkspaceConfirmation"
                            message={`An invite email has been sent!`}
                            description={
                                <>
                                    You can also share with them this link:{' '}
                                    <span className={styles.link}>
                                        {
                                            sendInviteEmailData.sendAdminWorkspaceInvite
                                        }
                                    </span>
                                </>
                            }
                        />
                    )}
                    <hr className={styles.hr} />
                    <p className={styles.boxSubTitle}>
                        Or share this link with them (this link expires{' '}
                        {moment(
                            data?.workspace_invite_links.expiration_date
                        ).fromNow()}
                        ).
                    </p>
                    <CopyText
                        text={getWorkspaceInvitationLink(
                            data?.workspace_invite_links.secret || '',
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
                        iconButton
                    >
                        <SvgTrash />
                    </Button>
                </PopConfirm>
            );
        },
    },
];
