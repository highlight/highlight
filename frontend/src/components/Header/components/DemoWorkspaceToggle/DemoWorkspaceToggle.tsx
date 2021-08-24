import { useAuthContext } from '@authentication/AuthContext';
import Button from '@components/Button/Button/Button';
import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import { Maybe, Organization } from '@graph/schemas';
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext';
import { History } from 'history';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import styles from './DemoWorkspaceToggle.module.scss';

interface Props {
    integrated: boolean;
}

const setHistory = (
    allApplications: Maybe<
        Maybe<
            {
                __typename?: 'Organization' | undefined;
            } & Pick<Organization, 'id' | 'name'>
        >[]
    >,
    currentApplication: Organization | undefined,
    history: History<unknown>,
    pathname: string
) => {
    const [, path] = pathname.split('/').filter((token) => token.length);

    let toVisit = `/0/${path}`;

    if (allApplications) {
        if (allApplications[0]?.id !== currentApplication?.id) {
            toVisit = `/${allApplications[0]?.id}/${path}`;
        } else {
            toVisit = `/${
                allApplications[allApplications.length - 1]?.id
            }/${path}`;
        }
    } else {
        toVisit = `/new`;
    }
    history.push(toVisit);
};

const DemoWorkspaceToggle = ({ integrated }: Props) => {
    const history = useHistory();
    const { pathname } = useLocation();
    const { allApplications, currentApplication } = useApplicationContext();
    const { isHighlightAdmin } = useAuthContext();

    if (!isHighlightAdmin) {
        return null;
    }

    if (currentApplication?.id !== '0' && integrated) {
        return null;
    }

    return (
        <Button
            className={styles.demoWorkspaceButton}
            type="primary"
            trackingId="DemoWorkspace"
            onClick={() => {
                setHistory(
                    allApplications,
                    currentApplication,
                    history,
                    pathname
                );
            }}
        >
            {currentApplication?.id !== '0' ? (
                <>
                    Visit Demo Workspace{' '}
                    <InfoTooltip
                        title="Visit our demo workspace to experience fully integrated Highlight."
                        className={styles.infoTooltip}
                    />
                </>
            ) : !!allApplications ? (
                <>Go back to your workspace!</>
            ) : (
                <>Create a new workspace!</>
            )}
        </Button>
    );
};

export default DemoWorkspaceToggle;
