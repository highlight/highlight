import { namedOperations } from '@graph/operations';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';

import { useOpenSlackConversationMutation } from '../../../../../graph/generated/hooks';
import { GetBaseURL } from '../../../../../util/window';

export const useSlackBot = (redirectPath: string) => {
    const history = useHistory();
    const { organization_id } = useParams<{ organization_id: string }>();
    const [openSlackConversation] = useOpenSlackConversationMutation({
        refetchQueries: [namedOperations.Query.GetOrganizations],
    });
    const [loading, setLoading] = useState<boolean>(false);

    const redirectUriOrigin = `${GetBaseURL()}/${organization_id}`;
    const slackUrl = `https://slack.com/oauth/v2/authorize?client_id=1354469824468.1868913469441&scope=channels:manage,groups:write,im:write,mpim:write,chat:write&redirect_uri=${redirectUriOrigin}/${redirectPath}`;

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code || loading) return;

        const sideEffect = async () => {
            try {
                setLoading(true);
                await openSlackConversation({
                    variables: {
                        organization_id: organization_id,
                        code,
                        redirect_path: redirectPath,
                    },
                });
                message.success(
                    'Personal tagging slack notifications have been setup.',
                    5
                );
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

        sideEffect();
    }, [
        openSlackConversation,
        history,
        loading,
        organization_id,
        redirectPath,
    ]);

    return {
        loading,
        slackUrl,
    };
};
