import { useSlackBot } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import { LoadingBar } from '@components/Loading/Loading';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';

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
                console.error('[gt]', e);
            }
            history.push(`/${project_id}/${next}`);
        })();
    }, [addSlackToWorkspace, integrationName, history, project_id]);

    return (
        <>
            <Helmet>
                <title>⏳</title>
            </Helmet>
            <LeadAlignLayout>
                <LoadingBar />
            </LeadAlignLayout>
        </>
    );
};

export default NewIntegrationPage;
