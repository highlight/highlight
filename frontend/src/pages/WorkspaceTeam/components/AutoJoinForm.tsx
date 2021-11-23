import { useAuthContext } from '@authentication/AuthContext';
import Select from '@components/Select/Select';
import Switch from '@components/Switch/Switch';
import React, { useEffect, useState } from 'react';

import styles from './AutoJoinForm.module.scss';

function AutoJoinForm() {
    const [enableAutoJoin, setEnableAutoJoin] = useState(false);
    const [emailDomains, setEmailDomains] = useState<string[]>([]);
    const { admin } = useAuthContext();

    const adminsEmailDomain = getEmailDomain(admin?.email);

    useEffect(() => {
        if (adminsEmailDomain) {
            setEmailDomains([adminsEmailDomain]);
        }
    }, [adminsEmailDomain]);

    return (
        <div className={styles.container}>
            <Switch
                trackingId="WorkspaceAutoJoin"
                label="Enable Auto Join"
                checked={enableAutoJoin}
                onChange={(checked) => {
                    setEnableAutoJoin(checked);
                }}
                className={styles.switchClass}
            />
            {enableAutoJoin && (
                <Select
                    placeholder={`${adminsEmailDomain}, acme.corp, piedpiper.com`}
                    className={styles.select}
                    value={emailDomains}
                    mode="tags"
                    onChange={setEmailDomains}
                    options={[
                        {
                            displayValue: adminsEmailDomain,
                            id: adminsEmailDomain,
                            value: adminsEmailDomain,
                        },
                    ]}
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
