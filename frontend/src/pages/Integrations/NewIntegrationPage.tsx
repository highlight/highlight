import { useSlackBot } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import {
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import { useParams } from '@util/react-router/useParams';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const NewIntegrationPage = () => {
    const { integrationName, project_id } = useParams<{
        integrationName: string;
        project_id: string;
    }>();
    const history = useHistory();
    const { setLoadingState } = useAppLoadingContext();

    const { addSlackToWorkspace } = useSlackBot({
        type: 'Organization',
    });

    useEffect(() => {
        setLoadingState(AppLoadingState.EXTENDED_LOADING);
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
            setLoadingState(AppLoadingState.LOADED);
            history.push(`/${project_id}/${next}`);
        })();
    }, [
        addSlackToWorkspace,
        integrationName,
        history,
        project_id,
        setLoadingState,
    ]);

    return null;
};

export default NewIntegrationPage;
