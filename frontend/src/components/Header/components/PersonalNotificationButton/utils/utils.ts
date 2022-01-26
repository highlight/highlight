import { namedOperations } from '@graph/operations';
import useLocalStorage from '@rehooks/local-storage';
import { useParams } from '@util/react-router/useParams';
import { GetBaseURL } from '@util/window';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import {
    useAddSlackBotIntegrationToProjectMutation,
    useGetWorkspaceIsIntegratedWithSlackQuery,
    useOpenSlackConversationMutation,
} from '../../../../../graph/generated/hooks';

export interface UseSlackBotProps {
    type: 'Organization' | 'Personal';
    watch: boolean;
}

const PersonalSlackScopes =
    'channels:manage,groups:write,im:write,mpim:write,chat:write';
const OrganizationSlackScopes =
    'channels:join,channels:manage,channels:read,chat:write,groups:read,groups:write,im:read,im:write,mpim:read,mpim:write,users:read,files:write';

export const useSlackBot = ({ type, watch }: UseSlackBotProps) => {
    let redirectPath = window.location.pathname;
    if (redirectPath.length > 3) {
        // remove project_id and prepended slash
        redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1);
    }
    const [setupType] = useLocalStorage<'' | 'Personal' | 'Organization'>(
        'Highlight-slackBotSetupType',
        ''
    );
    const history = useHistory();
    const { project_id } = useParams<{ project_id: string }>();
    const [openSlackConversation] = useOpenSlackConversationMutation({
        refetchQueries: [namedOperations.Query.GetProject],
    });
    const [
        addSlackBotIntegrationToProject,
        { called },
    ] = useAddSlackBotIntegrationToProjectMutation({
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [
        isSlackConnectedToWorkspace,
        setIsSlackConnectedToWorkspace,
    ] = useState<boolean>(false);

    const {
        data: slackIntegResponse,
        loading: slackIntegLoading,
        refetch,
    } = useGetWorkspaceIsIntegratedWithSlackQuery({
        variables: { project_id },
    });

    useEffect(() => {
        console.log(
            '[gt] use effect from backend setIsSlackConnectedToWorkspace',
            slackIntegResponse
        );
        if (!slackIntegResponse) return;
        setIsSlackConnectedToWorkspace(
            slackIntegResponse.is_integrated_with_slack || false
        );
    }, [slackIntegResponse, setIsSlackConnectedToWorkspace]);

    const slackUrl = getSlackUrl(type, project_id, redirectPath);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code || loading) return;

        const sideEffect = async () => {
            try {
                setLoading(true);
                if (setupType === 'Personal') {
                    await openSlackConversation({
                        variables: {
                            project_id: project_id,
                            code,
                            redirect_path: redirectPath,
                        },
                    });
                    message.success(
                        'Personal Slack notifications have been setup!',
                        5
                    );
                } else {
                    await addSlackBotIntegrationToProject({
                        variables: {
                            project_id: project_id,
                            code,
                            redirect_path: redirectPath,
                        },
                    });
                    console.log(
                        '[gt] add slack bot successful setIsSlackConnectedToWorkspace'
                    );
                    setIsSlackConnectedToWorkspace(true);
                    message.success('Highlight is now synced with Slack!', 5);
                }
            } catch (e) {}
            setLoading(false);
            // Remove the "code" URL param that Slack adds to the redirect URL.
            history.replace({ search: '' });
        };

        if (watch && !called && !loading) {
            sideEffect();
        }
    }, [
        openSlackConversation,
        history,
        loading,
        project_id,
        redirectPath,
        addSlackBotIntegrationToProject,
        watch,
        setupType,
        called,
        setIsSlackConnectedToWorkspace,
    ]);

    useEffect(() => {
        console.log('[gt]', { isSlackConnectedToWorkspace });
    }, [isSlackConnectedToWorkspace]);

    return {
        loading: loading || slackIntegLoading,
        slackUrl,
        isSlackConnectedToWorkspace,
        refetch,
    };
};

export const getSlackUrl = (
    type: 'Personal' | 'Organization',
    projectId: string,
    redirectPage?: string
) => {
    const slackScopes =
        type === 'Personal' ? PersonalSlackScopes : OrganizationSlackScopes;
    const redirectUri =
        `${GetBaseURL()}/${projectId}` +
        (redirectPage ? `/${redirectPage}` : '');

    const slackUrl = `https://slack.com/oauth/v2/authorize?client_id=1354469824468.1868913469441&scope=${slackScopes}&redirect_uri=${redirectUri}`;

    return slackUrl;
};
