import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';
import { useAddSlackIntegrationToWorkspaceMutation } from '../../../graph/generated/hooks';
import { Maybe } from '../../../graph/generated/schemas';
import integrationDetectorStyles from '../../Setup/IntegrationDetector/IntegrationDetector.module.scss';
import { ReactComponent as CheckIcon } from '../../../static/verify-check-icon.svg';
import useLocalStorage from '@rehooks/local-storage';

interface Props {
    redirectPath: string;
    integratedChannel?: Maybe<string>;
}

const SlackIntegration = ({ redirectPath, integratedChannel }: Props) => {
    const history = useHistory();
    const { organization_id } = useParams<{ organization_id: string }>();
    const [addSlackIntegration] = useAddSlackIntegrationToWorkspaceMutation({
        refetchQueries: ['GetOrganization'],
    });
    const [integrationLoading, setIntegrationLoading] = useState<
        boolean | undefined
    >(undefined);
    const searchLocation = window.location.search;
    const [, setHasStartedOnboarding] = useLocalStorage(
        `highlight-started-onboarding-${organization_id}`,
        false
    );

    const redirectUriOrigin = `${process.env.REACT_APP_FRONTEND_URI}/${organization_id}`;

    useEffect(() => {
        const urlParams = new URLSearchParams(searchLocation);
        const code = urlParams.get('code');
        if (!code) return;
        setIntegrationLoading(true);
        addSlackIntegration({
            variables: {
                organization_id: organization_id,
                code,
                redirect_path: redirectPath,
            },
        })
            .then(() => {
                message.success('Added Slack Alerts to your workspace!', 5);
            })
            .catch((e) =>
                message.error(`error adding slack integration: ${e}`, 5)
            )
            .finally(() => {
                // Remove the "code" URL param that Slack adds to the redirect URL.
                history.replace({ search: '' });
                setIntegrationLoading(false);
            });
    }, [
        addSlackIntegration,
        history,
        organization_id,
        redirectPath,
        searchLocation,
    ]);

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
            href={`https://slack.com/oauth/v2/authorize?client_id=1354469824468.1868913469441&scope=incoming-webhook&redirect_uri=${redirectUriOrigin}/${redirectPath}`}
            onClick={() => {
                setHasStartedOnboarding(true);
            }}
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
    );
};

export default SlackIntegration;
