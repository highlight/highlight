import { useSlackBot } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import {
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const IntegrationAuthCallbackPage = () => {
    const { integrationName } = useParams<{
        integrationName: string;
    }>();
    const history = useHistory();
    const { setLoadingState } = useAppLoadingContext();

    const { addSlackToWorkspace } = useSlackBot({
        type: 'Organization',
    });

    const { addLinearIntegrationToProject } = useLinearIntegration();

    useEffect(() => {
        setLoadingState(AppLoadingState.EXTENDED_LOADING);
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state') || '';
        try {
            const parsedState = JSON.parse(atob(state));
            const next = parsedState['next'];
            const project_id = parsedState['project_id'];

            if (!code) {
                history.push(`/${project_id}/${next}`);
                return;
            }

            (async () => {
                try {
                    if (integrationName.toLowerCase() === 'slack') {
                        await addSlackToWorkspace(code, project_id);
                    } else if (
                        integrationName.toLocaleLowerCase() === 'linear'
                    ) {
                        await addLinearIntegrationToProject({
                            variables: { project_id: project_id, code: code },
                        });
                        message.success(
                            'Highlight is now synced with Linear!',
                            5
                        );
                    }
                } catch (e) {
                    console.error(e);
                }
                setLoadingState(AppLoadingState.LOADED);
                history.push(`/${project_id}/${next}`);
            })();
        } catch (e) {
            console.error(e);
            history.push('/');
        }
    }, [
        addSlackToWorkspace,
        integrationName,
        history,
        setLoadingState,
        addLinearIntegrationToProject,
    ]);

    return null;
};

export default IntegrationAuthCallbackPage;
