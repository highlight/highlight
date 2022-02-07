import { useSlackBot } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import { LoadingPage } from '@components/Loading/Loading';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './NewIntegrationPage.module.scss';

const NewIntegrationPage = () => {
    const { integrationName, project_id } = useParams<{
        integrationName: string;
        project_id: string;
    }>();
    const history = useHistory();

    const { addSlackToWorkspace } = useSlackBot({
        type: 'Organization',
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const next = urlParams.get('next');
        const redirectUri =
            `integrations/slack` +
            (next ? `?next=${encodeURIComponent(next)}` : '');

        if (!code) {
            history.push(`/${project_id}/${next}`);
            return;
        }

        (async () => {
            try {
                if (integrationName.toLowerCase() === 'slack') {
                    await addSlackToWorkspace(code, redirectUri);
                }
            } catch (e) {
                console.error(e);
            }
            history.push(`/${project_id}/${next}`);
        })();
    }, [addSlackToWorkspace, integrationName, history, project_id]);

    return (
        <div className={styles.loadingContainer}>
            <LoadingPage show />
        </div>
    );
};

export default NewIntegrationPage;
