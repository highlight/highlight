import { namedOperations } from '@graph/operations';
import useLocalStorage from '@rehooks/local-storage';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import {
    useAddSlackBotIntegrationToOrganizationMutation,
    useOpenSlackConversationMutation,
} from '../../../../../graph/generated/hooks';
import { GetBaseURL } from '../../../../../util/window';

export interface UseSlackBotProps {
    type: 'Organization' | 'Personal';
    watch: boolean;
}

const PersonalSlackScopes =
    'channels:manage,groups:write,im:write,mpim:write,chat:write';
const OrganizationSlackScopes =
    'channels:join,channels:manage,channels:read,chat:write,groups:read,groups:write,im:read,im:write,mpim:read,mpim:write,users:read';

export const useSlackBot = ({ type, watch }: UseSlackBotProps) => {
    let redirectPath = window.location.pathname;
    if (redirectPath.length > 3) {
        // remove orgid and prepended slash
        redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1);
    }
    const [setupType] = useLocalStorage<'' | 'Personal' | 'Organization'>(
        'Highlight-slackBotSetupType',
        ''
    );
    const history = useHistory();
    const { organization_id } = useParams<{ organization_id: string }>();
    const [openSlackConversation] = useOpenSlackConversationMutation({
        refetchQueries: [namedOperations.Query.GetOrganization],
    });
    const [
        addSlackBotIntegrationToOrganization,
    ] = useAddSlackBotIntegrationToOrganizationMutation({
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const [loading, setLoading] = useState<boolean>(false);

    const slackUrl = getSlackUrl(type, organization_id, redirectPath);

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
                            organization_id: organization_id,
                            code,
                            redirect_path: redirectPath,
                        },
                    });
                    message.success(
                        'Personal Slack notifications have been setup!',
                        5
                    );
                } else if (setupType === 'Organization') {
                    await addSlackBotIntegrationToOrganization({
                        variables: {
                            organization_id: organization_id,
                            code,
                            redirect_path: redirectPath,
                        },
                    });
                    message.success('Highlight is now synced with Slack!', 5);
                }
            } catch (e) {
                message.error(
                    `There was an error with Slack, please try again.: ${e}`,
                    5
                );
            }
            setLoading(false);
            // Remove the "code" URL param that Slack adds to the redirect URL.
            history.replace({ search: '' });
        };

        if (watch) {
            sideEffect();
        }
    }, [
        openSlackConversation,
        history,
        loading,
        organization_id,
        redirectPath,
        addSlackBotIntegrationToOrganization,
        watch,
        setupType,
    ]);

    return {
        loading,
        slackUrl,
    };
};

export const getSlackUrl = (
    type: 'Personal' | 'Organization',
    organizationId: string,
    redirectPath: string
) => {
    const slackScopes =
        type === 'Personal' ? PersonalSlackScopes : OrganizationSlackScopes;
    const redirectUriOrigin = `${GetBaseURL()}/${organizationId}`;

    const slackUrl = `https://slack.com/oauth/v2/authorize?client_id=1354469824468.1868913469441&scope=${slackScopes}&redirect_uri=${redirectUriOrigin}/${redirectPath}`;

    return slackUrl;
};
