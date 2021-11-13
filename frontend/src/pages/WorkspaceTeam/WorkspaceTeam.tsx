import Alert from '@components/Alert/Alert';
import Card from '@components/Card/Card';
import CopyText from '@components/CopyText/CopyText';
import Input from '@components/Input/Input';
import Modal from '@components/Modal/Modal';
import Select from '@components/Select/Select';
import Table from '@components/Table/Table';
import { AdminRole } from '@graph/schemas';
import SvgTrash from '@icons/Trash';
import { getWorkspaceInvitationLink } from '@pages/WorkspaceTeam/utils';
import { useParams } from '@util/react-router/useParams';
import { getDisplayNameFromEmail, titleCaseString } from '@util/string';
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
    useChangeAdminRoleMutation,
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
    const [newAdminRole, setNewAdminRole] = useState<AdminRole>(
        AdminRole.Admin
    );

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
    const [changeAdminRole] = useChangeAdminRoleMutation();

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
                role: newAdminRole,
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
                                addonAfter={
                                    <Select
                                        bordered={false}
                                        value={newAdminRole}
                                        options={(Object.keys(
                                            AdminRole
                                        ) as (keyof typeof AdminRole)[]).map(
                                            (key) => {
                                                const role = AdminRole[key];

                                                return {
                                                    displayValue: titleCaseString(
                                                        role
                                                    ),
                                                    id: role,
                                                    value: role,
                                                };
                                            }
                                        )}
                                        onChange={setNewAdminRole}
                                    />
                                }
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
                    columns={
                        admin?.role === AdminRole.Admin
                            ? TABLE_COLUMNS
                            : TABLE_COLUMNS.slice(0, 2)
                    }
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
                        onUpdateRoleHandler: (new_role: string) => {
                            changeAdminRole({
                                variables: {
                                    admin_id: member!.id,
                                    workspace_id,
                                    new_role,
                                },
                            });

                            let messageText = '';
                            const displayName =
                                member?.name ||
                                getDisplayNameFromEmail(member?.email || '');
                            switch (new_role) {
                                case AdminRole.Admin:
                                    messageText = `${displayName} has been granted Admin powers 🧙`;
                                    break;
                                case AdminRole.Member:
                                    messageText = `${displayName} will no longer have access to billing`;
                                    break;
                            }
                            message.success(messageText);
                        },
                        currentAdminHasAdminRole:
                            admin?.role === AdminRole.Admin,
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
                                : getDisplayNameFromEmail(record.email)}{' '}
                            {record.isSameAdmin && '(You)'}
                        </h4>
                        <div className={styles.email}>{record?.email}</div>
                    </div>
                </div>
            );
        },
    },
    {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        render: (role: string, record: any) => {
            if (record.currentAdminHasAdminRole) {
                return (
                    <div className={styles.role}>
                        <Select
                            disabled={record.isSameAdmin}
                            onChange={record.onUpdateRoleHandler}
                            options={(Object.keys(
                                AdminRole
                            ) as (keyof typeof AdminRole)[]).map((key) => {
                                const role = AdminRole[key];

                                return {
                                    displayValue: titleCaseString(role),
                                    id: role,
                                    value: role,
                                };
                            })}
                            defaultValue={record.role}
                        />
                    </div>
                );
            }
            return <div className={styles.role}>{titleCaseString(role)}</div>;
        },
    },
    {
        title: 'Remove',
        dataIndex: 'remove',
        key: 'remove',
        render: (_: any, record: any) => {
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
