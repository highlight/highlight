import { H } from 'highlight.run';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useApplicationContext } from '../../../../routers/OrgRouter/ApplicationContext';
import InfoTooltip from '../../../InfoTooltip/InfoTooltip';
import Switch from '../../../Switch/Switch';
import styles from './DemoWorkspaceToggle.module.scss';

const DemoWorkspaceToggle = () => {
    const history = useHistory();
    const { pathname } = useLocation();
    const { allApplications, currentApplication } = useApplicationContext();

    return (
        <div className={styles.sectionBody}>
            <Switch
                label={
                    <>
                        Demo Workspace{' '}
                        <InfoTooltip
                            title="Visit our demo workspace to experience fully integrated Highlight."
                            className={styles.infoTooltip}
                        />
                    </>
                }
                labelFirst={true}
                checked={currentApplication?.id === '0'}
                onChange={() => {
                    const [, path] = pathname
                        .split('/')
                        .filter((token) => token.length);
                    if (currentApplication?.id !== '0') {
                        H.track('ViewDemoApplication', {
                            currentApplicationID: currentApplication?.id || '',
                        });
                        history.push(`/0/${path}`);
                    } else if (allApplications) {
                        for (let i = 0; i < allApplications?.length; i++) {
                            if (
                                allApplications[i]?.id !==
                                currentApplication?.id
                            ) {
                                history.push(
                                    `/${allApplications[i]?.id}/${path}`
                                );
                            }
                        }
                    } else {
                        history.push(`/new`);
                    }
                }}
            />
        </div>
    );
};

export default DemoWorkspaceToggle;
