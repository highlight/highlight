import useLocalStorage from '@rehooks/local-storage';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';

import {
    useAddSlackIntegrationToWorkspaceMutation,
    useOpenSlackConversationMutation,
} from '../../../graph/generated/hooks';
import { Maybe } from '../../../graph/generated/schemas';
import { ReactComponent as CheckIcon } from '../../../static/verify-check-icon.svg';
import { GetBaseURL } from '../../../util/window';
import integrationDetectorStyles from '../../Setup/IntegrationDetector/IntegrationDetector.module.scss';

interface Props {
    redirectPath: string;
    integratedChannel?: Maybe<string>;
}

const SlackIntegration = ({ redirectPath, integratedChannel }: Props) => {
    const { loading, slackUrl } = useSlack(redirectPath);
    const { organization_id } = useParams<{ organization_id: string }>();
    const [, setHasStartedOnboarding] = useLocalStorage(
        `highlight-started-onboarding-${organization_id}`,
        false
    );

    if (integratedChannel) {
        return (
            <div className={integrationDetectorStyles.detector}>
                <div className={integrationDetectorStyles.detectorWrapper}>
                    <CheckIcon
                        className={integrationDetectorStyles.checkIcon}
                    />
                </div>
                <p className={integrationDetectorStyles.verificationText}>
                    Alerts will be sent to {integratedChannel}.
                </p>
            </div>
        );
    }

    return (
        <a
            href={slackUrl}
            onClick={() => {
                setHasStartedOnboarding(true);
            }}
        >
            {loading ? (
                'loading'
            ) : (
                <img
                    alt="Add to Slack"
                    height="40"
                    width="139"
                    src="https://platform.slack-edge.com/img/add_to_slack.png"
                    srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                />
            )}
        </a>
    );
};

export default SlackIntegration;

export const useSlack = (redirectPath: string, refetchQueries?: string[]) => {
    const history = useHistory();
    const { organization_id } = useParams<{ organization_id: string }>();
    const [addSlackIntegration] = useAddSlackIntegrationToWorkspaceMutation({
        refetchQueries: ['GetOrganization'],
    });
    const [loading, setLoading] = useState<boolean>(false);

    const redirectUriOrigin = `${GetBaseURL()}/${organization_id}`;
    const slackUrl = `https://slack.com/oauth/v2/authorize?client_id=1354469824468.1868913469441&scope=incoming-webhook&redirect_uri=${redirectUriOrigin}/${redirectPath}`;

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code || loading) return;

        const sideEffect = async () => {
            try {
                setLoading(true);
                await addSlackIntegration({
                    variables: {
                        organization_id: organization_id,
                        code,
                        redirect_path: redirectPath,
                    },
                    refetchQueries: refetchQueries,
                });
                message.success(
                    'The Slack channel has been integrated, you can now pick it.',
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
        addSlackIntegration,
        history,
        loading,
        organization_id,
        redirectPath,
        refetchQueries,
    ]);

    return {
        loading,
        slackUrl,
    };
};

export const useSlackBot = (redirectPath: string) => {
    const history = useHistory();
    const { organization_id } = useParams<{ organization_id: string }>();
    const [openSlackConversation] = useOpenSlackConversationMutation({
        refetchQueries: ['GetOrganization'],
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
