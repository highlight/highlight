import { useAuthContext } from '@authentication/AuthContext';
import Button from '@components/Button/Button/Button';
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import styles from './DemoWorkspaceButton.module.scss';

interface Props {
    integrated: boolean;
}

const DemoWorkspaceButton = ({ integrated }: Props) => {
    const history = useHistory();
    const { pathname } = useLocation();
    const { currentApplication } = useApplicationContext();
    const { isHighlightAdmin } = useAuthContext();

    const [, path] = pathname.split('/').filter((token) => token.length);

    if (!isHighlightAdmin) {
        return null;
    }

    if (integrated && currentApplication?.id !== '0') {
        return null;
    }

    return (
        <Button
            className={styles.demoWorkspaceButton}
            type="primary"
            trackingId="DemoWorkspace"
            onClick={() => {
                history.push(`/0/${path}`);
            }}
        >
            Visit Demo Workspace
        </Button>
    );
};

export default DemoWorkspaceButton;
