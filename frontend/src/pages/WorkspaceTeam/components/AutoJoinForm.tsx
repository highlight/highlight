import { useAuthContext } from '@authentication/AuthContext';
import Select from '@components/Select/Select';
import Switch from '@components/Switch/Switch';
import { useGetWorkspaceAdminsQuery } from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import React, { useState } from 'react';

import styles from './AutoJoinForm.module.scss';

function AutoJoinForm() {
    const { workspace_id } = useParams<{ workspace_id: string }>();
    const { admin } = useAuthContext();
    const { loading } = useGetWorkspaceAdminsQuery({
        variables: { workspace_id },
        onCompleted: (d) => {
            if (d.workspace?.allowed_auto_join_email_origins) {
                const emailOrigins = JSON.parse(
                    d.workspace.allowed_auto_join_email_origins
                );
                setEmailOrigins(emailOrigins);
            } else {
                setEmailOrigins([adminsEmailDomain]);
            }
        },
    });
    const [emailOrigins, setEmailOrigins] = useState<string[]>([]);

    const adminsEmailDomain = getEmailDomain(admin?.email);

    return (
        <div className={styles.container}>
            <Switch
                trackingId="WorkspaceAutoJoin"
                label="Enable Auto Join"
                checked={emailOrigins.length > 0}
                loading={loading}
                onChange={(checked) => {
                    if (checked) {
                        setEmailOrigins([adminsEmailDomain]);
                    } else {
                        setEmailOrigins([]);
                    }
                }}
                className={styles.switchClass}
            />
            {emailOrigins.length > 0 && (
                <Select
                    placeholder={`${adminsEmailDomain}, acme.corp, piedpiper.com`}
                    className={styles.select}
                    defaultActiveFirstOption
                    loading={loading}
                    value={emailOrigins}
                    mode="tags"
                    onChange={setEmailOrigins}
                    options={emailOrigins.map((emailOrigin) => ({
                        displayValue: emailOrigin,
                        id: emailOrigin,
                        value: emailOrigin,
                    }))}
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
