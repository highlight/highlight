import { useAuthContext } from '@authentication/AuthContext';
import Alert from '@components/Alert/Alert';
import Select from '@components/Select/Select';
import Switch from '@components/Switch/Switch';
import {
    useGetWorkspaceAdminsQuery,
    useUpdateAllowedEmailOriginsMutation,
} from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import React, { useState } from 'react';

import styles from './AutoJoinForm.module.scss';

function AutoJoinForm() {
    const { workspace_id } = useParams<{ workspace_id: string }>();
    const { admin } = useAuthContext();
    const [originalOrigins, setOriginalOrigins] = useState<string[]>([]);
    const { loading } = useGetWorkspaceAdminsQuery({
        variables: { workspace_id },
        onCompleted: (d) => {
            if (d.workspace?.allowed_auto_join_email_origins) {
                const emailOrigins = JSON.parse(
                    d.workspace.allowed_auto_join_email_origins
                );
                setEmailOrigins(emailOrigins);
                setOriginalOrigins(originalOrigins);
            }
            const allowedDomains: string[] = [];
            d.admins.forEach((a) => {
                const adminDomain = getEmailDomain(a?.email);
                if (
                    a?.email_verified &&
                    adminDomain.length > 0 &&
                    !blackListedDomains.includes(adminDomain) &&
                    !allowedDomains.includes(adminDomain)
                )
                    allowedDomains.push(adminDomain);
            });
            setAllowedEmailOrigins(allowedDomains);
        },
    });

    const [emailOrigins, setEmailOrigins] = useState<string[]>([]);

    const [updateAllowedEmailOrigins] = useUpdateAllowedEmailOriginsMutation();
    const onChangeMsg = (domains: string[], msg: string) => {
        setEmailOrigins(domains);
        updateAllowedEmailOrigins({
            variables: {
                allowed_auto_join_email_origins: JSON.stringify(domains),
                workspace_id: workspace_id,
            },
            refetchQueries: [namedOperations.Query.GetWorkspaceAdmins],
        }).then(() => {
            message.success(msg);
        });
    };
    const onChange = (domains: string[]) => {
        onChangeMsg(domains, 'Successfully updated auto-join email domains!');
    };

    const [allowedEmailOrigins, setAllowedEmailOrigins] = useState<string[]>(
        []
    );

    const adminsEmailDomain = getEmailDomain(admin?.email);

    const blackListedDomains = [
        'gmail.com',
        'yahoo.com',
        'hotmail.com',
        'outlook.com',
        'protonmail.com',
        'aol.com',
    ];

    return (
        <div className={styles.container}>
            {allowedEmailOrigins.length > 0 ? (
                <>
                    <Switch
                        trackingId="WorkspaceAutoJoin"
                        label="Enable Auto Join"
                        checked={emailOrigins.length > 0}
                        loading={loading}
                        onChange={(checked) => {
                            if (checked) {
                                if (
                                    admin?.email_verified &&
                                    !blackListedDomains.includes(
                                        adminsEmailDomain
                                    )
                                ) {
                                    onChangeMsg(
                                        [adminsEmailDomain],
                                        'Successfully enabled auto-join!'
                                    );
                                }
                            } else {
                                onChangeMsg(
                                    [],
                                    'Successfully disabled auto-join!'
                                );
                            }
                        }}
                        className={styles.switchClass}
                    />
                    <Select
                        placeholder={`${adminsEmailDomain}, acme.corp, piedpiper.com`}
                        className={styles.select}
                        loading={loading}
                        value={emailOrigins}
                        mode="tags"
                        onChange={onChange}
                        options={allowedEmailOrigins.map((emailOrigin) => ({
                            displayValue: emailOrigin,
                            id: emailOrigin,
                            value: emailOrigin,
                        }))}
                    />
                </>
            ) : (
                <Alert
                    type="warning"
                    closable={false}
                    trackingId="noValidEmailDomains"
                    message="No one on your team has a verified, custom email domain!"
                    description={
                        <>
                            {'Use a '}
                            <a
                                target="_"
                                href="https://domains.google/get-started/email/"
                            >
                                custom domain
                            </a>
                            {
                                ' when signing up for highlight to enable auto-join for your workspace!'
                            }
                        </>
                    }
                />
            )}
        </div>
    );
}

export default AutoJoinForm;

const getEmailDomain = (email?: string) => {
    if (!email) {
        return '';
    }
    if (!email.includes('@')) {
        return '';
    }

    const [, domain] = email.split('@');
    return domain;
};
