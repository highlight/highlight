import { IntegrationConfigProps } from '@pages/IntegrationsPage/components/Integration';
import LinearIntegrationConfig from '@pages/IntegrationsPage/components/LinearIntegration/LinearIntegrationConfig';
import SlackIntegrationConfig from '@pages/IntegrationsPage/components/SlackIntegration/SlackIntegrationConfig';
import React from 'react';

export interface Integration {
    key: string;
    name: string;
    externalLink?: string;
    configurationPath: string;
    description: string;
    defaultEnable?: boolean;
    icon: string;
    /**
     * The page to configure the integration. This can be rendered in a modal or on a different page.
     */
    configurationPage: (opts: IntegrationConfigProps) => React.ReactNode;
}

const INTEGRATIONS: Integration[] = [
    {
        key: 'slack',
        name: 'Slack',
        configurationPath: 'slack',
        description:
            'Bring your Highlight comments and alerts to slack as messages.',
        icon: 'https://img.stackshare.io/service/675/RNiSRYOF_400x400.jpg',
        configurationPage: (opts) => <SlackIntegrationConfig {...opts} />,
    },
    {
        key: 'linear',
        name: 'Linear',
        configurationPath: 'linear',
        description: 'Bring your Highlight comments to Linear as issues.',
        icon: 'https://img.stackshare.io/service/12513/MF6whgy1_400x400.png',
        configurationPage: (opts) => <LinearIntegrationConfig {...opts} />,
    },
];

export default INTEGRATIONS;
