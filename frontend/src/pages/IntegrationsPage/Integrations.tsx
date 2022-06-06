import ClearbitIntegrationConfig from '@pages/IntegrationsPage/components/ClearbitIntegration/ClearbitIntegrationConfig';
import { IntegrationConfigProps } from '@pages/IntegrationsPage/components/Integration';
import LinearIntegrationConfig from '@pages/IntegrationsPage/components/LinearIntegration/LinearIntegrationConfig';
import SlackIntegrationConfig from '@pages/IntegrationsPage/components/SlackIntegration/SlackIntegrationConfig';
import ZapierIntegrationConfig from '@pages/IntegrationsPage/components/ZapierIntegration/ZapierIntegrationConfig';
import React from 'react';

export interface Integration {
    key: string;
    name: string;
    externalLink?: string;
    configurationPath: string;
    description: string;
    defaultEnable?: boolean;
    icon: string;
    onlyShowForHighlightAdmin?: boolean;
    /**
     * The page to configure the integration. This can be rendered in a modal or on a different page.
     */
    configurationPage: (opts: IntegrationConfigProps) => React.ReactNode;
}

export const SLACK_INTEGRATION: Integration = {
    key: 'slack',
    name: 'Slack',
    configurationPath: 'slack',
    description:
        'Bring your Highlight comments and alerts to slack as messages.',
    icon: '/images/integrations/slack.jpg',
    configurationPage: (opts) => <SlackIntegrationConfig {...opts} />,
};

export const LINEAR_INTEGRATION: Integration = {
    key: 'linear',
    name: 'Linear',
    configurationPath: 'linear',
    description: 'Bring your Highlight comments to Linear as issues.',
    icon: '/images/integrations/linear.png',
    configurationPage: (opts) => <LinearIntegrationConfig {...opts} />,
};

export const ZAPIER_INTEGRATION: Integration = {
    key: 'zapier',
    name: 'Zapier',
    configurationPath: 'zapier',
    onlyShowForHighlightAdmin: true,
    description: 'Use Highlight alerts to trigger a Zap.',
    icon: '/images/integrations/zapier.png',
    configurationPage: (opts) => <ZapierIntegrationConfig {...opts} />,
};

export const CLEARBIT_INTEGRATION: Integration = {
    key: 'clearbit',
    name: 'Clearbit',
    configurationPath: 'clearbit',
    onlyShowForHighlightAdmin: true,
    description: 'Collect enhanced user analytics.',
    icon: '/images/integrations/clearbit.svg',
    configurationPage: (opts) => <ClearbitIntegrationConfig {...opts} />,
};

const INTEGRATIONS: Integration[] = [
    SLACK_INTEGRATION,
    LINEAR_INTEGRATION,
    ZAPIER_INTEGRATION,
    CLEARBIT_INTEGRATION,
];

export default INTEGRATIONS;
