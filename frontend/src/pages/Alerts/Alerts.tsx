import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAddSlackIntegrationToWorkspaceMutation } from '../../graph/generated/hooks';

import { alertsBody } from './Alerts.module.scss';

export const AlertsPage = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [addSlackIntegration] = useAddSlackIntegrationToWorkspaceMutation();
    console.log(process.env.REACT_APP_ENVIRONMENT);
    console.log(process.env.REACT_APP_ENVIRONMENT === 'dev');
    console.log(process.env.REACT_APP_LOCAL_TUNNEL_URI);
    const redirect =
        (process.env.REACT_APP_ENVIRONMENT === 'dev'
            ? process.env.REACT_APP_LOCAL_TUNNEL_URI
            : process.env.REACT_APP_FRONTEND_URI) +
        `/${organization_id}/alerts`;
    console.log(redirect);
    const searchLocation = window.location.search;

    useEffect(() => {
        const urlParams = new URLSearchParams(searchLocation);
        const code = urlParams.get('code');
        if (!code) return;
        console.log('code', code);
        addSlackIntegration({
            variables: { organization_id: organization_id, code: code },
        }).then((r) => console.log('resp', r.data));
    }, [addSlackIntegration, organization_id, searchLocation]);

    return (
        <div className={alertsBody}>
            <a
                href={`https://slack.com/oauth/v2/authorize?client_id=1354469824468.1868913469441&scope=incoming-webhook&redirect_uri=${redirect}`}
            >
                <img
                    alt="Add to Slack"
                    height="40"
                    width="139"
                    src="https://platform.slack-edge.com/img/add_to_slack.png"
                    srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                />
            </a>
        </div>
    );
};
