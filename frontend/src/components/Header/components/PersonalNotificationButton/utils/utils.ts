import { namedOperations } from '@graph/operations';
import useLocalStorage from '@rehooks/local-storage';
import { useParams } from '@util/react-router/useParams';
import { GetBaseURL } from '@util/window';
import { message } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import {
    useAddSlackBotIntegrationToProjectMutation,
    useGetWorkspaceIsIntegratedWithSlackQuery,
    useOpenSlackConversationMutation,
} from '../../../../../graph/generated/hooks';

export interface UseSlackBotProps {
    type: 'Organization' | 'Personal';
}

const PersonalSlackScopes =
    'channels:manage,groups:write,im:write,mpim:write,chat:write';
const OrganizationSlackScopes =
    'channels:join,channels:manage,channels:read,chat:write,groups:read,groups:write,im:read,im:write,mpim:read,mpim:write,users:read,files:write';

export const useSlackBot = ({ type }: UseSlackBotProps) => {
    const [setupType] = useLocalStorage<'' | 'Personal' | 'Organization'>(
        'Highlight-slackBotSetupType',
        ''
    );
    const { project_id } = useParams<{ project_id: string }>();
    const [openSlackConversation] = useOpenSlackConversationMutation({
        refetchQueries: [namedOperations.Query.GetProject],
    });
    const [
        addSlackBotIntegrationToProject,
    ] = useAddSlackBotIntegrationToProjectMutation({
        refetchQueries: [
            namedOperations.Query.GetAlertsPagePayload,
            namedOperations.Query.GetWorkspaceIsIntegratedWithSlack,
        ],
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
        if (!slackIntegResponse) return;
        console.log(
            '[gt] setIsSlackConnectedToWorkspace after slackIntegResponse',
            slackIntegResponse
        );
        setIsSlackConnectedToWorkspace(
            slackIntegResponse.is_integrated_with_slack || false
        );
    }, [slackIntegResponse, setIsSlackConnectedToWorkspace]);

    const slackUrl = getSlackUrl(type, project_id);

    const addSlackToWorkspace = useCallback(
        async (code: string, redirectPath: string) => {
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
                setIsSlackConnectedToWorkspace(true);
                message.success('Highlight is now synced with Slack!', 5);
            }
            setLoading(false);
        },
        [
            setLoading,
            setupType,
            project_id,
            openSlackConversation,
            addSlackBotIntegrationToProject,
            setIsSlackConnectedToWorkspace,
        ]
    );

    return {
        loading: loading || slackIntegLoading,
        slackUrl,
        isSlackConnectedToWorkspace,
        refetch,
        addSlackToWorkspace,
    };
};

export const getSlackUrl = (
    type: 'Personal' | 'Organization',
    projectId: string
) => {
    let redirectPath = window.location.pathname;
    if (redirectPath.length > 3) {
        // remove project_id and prepended slash
        redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1);
    }

    const slackScopes =
        type === 'Personal' ? PersonalSlackScopes : OrganizationSlackScopes;
    const redirectUri =
        `${GetBaseURL()}/${projectId}/integrations/slack` +
        (redirectPath ? `?next=${encodeURIComponent(redirectPath)}` : '');

    const slackUrl = `https://slack.com/oauth/v2/authorize?client_id=1354469824468.1868913469441&scope=${encodeURIComponent(
        slackScopes
    )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return slackUrl;
};
