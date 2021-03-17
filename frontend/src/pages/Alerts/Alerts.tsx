import { message } from 'antd';
import React, { HTMLProps, useEffect, useState } from 'react';
import { RouteComponentProps, useParams, withRouter } from 'react-router-dom';
import { useAddSlackIntegrationToWorkspaceMutation } from '../../graph/generated/hooks';

import { alertsBody } from './Alerts.module.scss';

interface AlertsProp {
    redirect_path: string;
}

const Alerts: React.FC<
    RouteComponentProps & HTMLProps<HTMLDivElement> & AlertsProp
> = ({ history, className, redirect_path }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [addSlackIntegration] = useAddSlackIntegrationToWorkspaceMutation();
    const [integrationLoading, setIntegrationLoading] = useState<
        boolean | undefined
    >(undefined);
    const searchLocation = window.location.search;

    useEffect(() => {
        const urlParams = new URLSearchParams(searchLocation);
        const code = urlParams.get('code');
        if (!code) return;
        setIntegrationLoading(true);
        addSlackIntegration({
            variables: {
                organization_id: organization_id,
                code,
                redirect_path,
            },
        })
            .then(() => {
                setIntegrationLoading(false);
                message.success('Added Slack Alerts to your workspace!', 5);
            })
            .catch((e) =>
                message.error(`error adding slack integration: ${e}`, 5)
            )
            .finally(() => {
                // Remove the "code" URL param that Slack adds to the redirect URL.
                history.replace({ search: '' });
            });
    }, [
        addSlackIntegration,
        history,
        organization_id,
        redirect_path,
        searchLocation,
    ]);

    const redirectUriOrigin = `${
        process.env.REACT_APP_ENVIRONMENT === 'dev'
            ? process.env.REACT_APP_LOCAL_TUNNEL_URI
            : process.env.REACT_APP_FRONTEND_URI
    }/${organization_id}`;

    return (
        <div className={className || alertsBody}>
            <a
                href={`https://slack.com/oauth/v2/authorize?client_id=1354469824468.1868913469441&scope=incoming-webhook&redirect_uri=${redirectUriOrigin}/${path}`}
            >
                {integrationLoading ? (
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
        </div>
    );
};

export const AlertsPage = withRouter(Alerts);
