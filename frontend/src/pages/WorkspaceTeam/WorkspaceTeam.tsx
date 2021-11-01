import { useParams } from '@util/react-router/useParams';
import { message, Skeleton } from 'antd';
import classNames from 'classnames/bind';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

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
import SvgTrash from '../../static/Trash';
import { getWorkspaceInvitationLink, roleToDisplayValueMapping } from './utils';
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
            <h2>Invite A Member</h2>
            <p className={layoutStyles.subTitle}>
                Invite your team to your Workspace.
            </p>
            <div className={styles.box}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <h3>Invite Your Team</h3>
                    <p className={styles.boxSubTitle}>
                        Invite a team member to '{`${data?.workspace?.name}`}'
                        by entering an email below.
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
                                        color: 'var(--text-primary-inverted)',
                                    }}
                                />
                            ) : (
                                'Invite'
                            )}
                        </Button>
                    </div>
                    <div className={commonStyles.errorMessage}>
                        {errors.email &&
                            'Error validating email ' + errors.email.message}
                    </div>
                </form>
                <p>Or invite your team by sharing this link.</p>
                <CopyText
                    text={getWorkspaceInvitationLink(
                        data?.workspace?.secret || '',
                        workspace_id
                    )}
                />
            </div>
            <div className={styles.box}>
                <h3>Members</h3>
                {loading ? (
                    <Skeleton />
                ) : (
                    data?.admins?.map((a) => {
                        return (
                            <div key={a?.id} className={styles.memberCard}>
                                <AdminAvatar
                                    adminInfo={{
                                        email: a?.email,
                                        name: a?.name,
                                        photo_url: a?.photo_url,
                                    }}
                                    size={45}
                                />
                                <div className={styles.userDetails}>
                                    <div className={styles.header}>
                                        <h4 className={styles.name}>
                                            {a?.name
                                                ? a?.name
                                                : a?.email.split('@')[0]}
                                        </h4>
                                        <span
                                            className={classNames(styles.role)}
                                        >
                                            {a?.role &&
                                                //     @ts-expect-error
                                                roleToDisplayValueMapping[
                                                    a?.role
                                                ]}
                                        </span>
                                    </div>
                                    <div className={styles.email}>
                                        {a?.email}
                                    </div>
                                </div>

                                <PopConfirm
                                    title={`Remove ${a?.name || a?.email}?`}
                                    description={`They will no longer have access to Highlight. You can invite them again if they need access.`}
                                    okText={`Remove ${a?.name || a?.email}`}
                                    cancelText="Cancel"
                                    onConfirm={() => {
                                        if (a?.id) {
                                            deleteAdminFromWorkspace({
                                                variables: {
                                                    admin_id: a?.id,
                                                    workspace_id,
                                                },
                                            });
                                        }
                                    }}
                                >
                                    <Button
                                        className={
                                            styles.removeTeamMemberButton
                                        }
                                        iconButton
                                        trackingId="RemoveTeamMember"
                                        // An Admin should not be able to delete themselves from an project.
                                        disabled={a?.id === admin?.id}
                                    >
                                        <SvgTrash />
                                    </Button>
                                </PopConfirm>
                            </div>
                        );
                    })
                )}
            </div>
        </LeadAlignLayout>
    );
};

export default WorkspaceTeam;
