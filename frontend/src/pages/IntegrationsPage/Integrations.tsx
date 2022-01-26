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
    configurationPage: (
        setModalOpen: (newVal: boolean) => void,
        setIntegrationEnabled: (newVal: boolean) => void
    ) => React.ReactNode;
    deleteConfirmationPage?: (
        setModalOpen: (newVal: boolean) => void,
        setIntegrationEnabled: (newVal: boolean) => void
    ) => React.ReactNode;
}

const INTEGRATIONS: Integration[] = [
    {
        key: 'slack',
        name: 'Slack',
        configurationPath: 'slack',
        description:
            'Bring your Highlight comments and alerts to slack as messages.',
        icon: 'https://img.stackshare.io/service/675/RNiSRYOF_400x400.jpg',
        configurationPage: () => (
            <>
                <h2>Boba</h2>
            </>
        ),
    },
    {
        key: 'linear2',
        name: 'Jira',
        configurationPath: 'linear',
        description: 'Bring your Highlight comments to Linear as issues.',
        icon: 'https://img.stackshare.io/service/12513/MF6whgy1_400x400.png',
        configurationPage: () => (
            <>
                <h2>Boba</h2>
            </>
        ),
    },
    {
        key: 'linear3',
        name: 'ClickUp',
        configurationPath: 'linear',
        description: 'Bring your Highlight comments to Linear as issues.',
        icon: 'https://img.stackshare.io/service/12513/MF6whgy1_400x400.png',
        configurationPage: () => (
            <>
                <h2>Boba</h2>
            </>
        ),
    },
    {
        key: 'linear4',
        name: 'Web Hooks',
        configurationPath: 'linear',
        description: 'Bring your Highlight comments to Linear as issues.',
        icon: 'https://img.stackshare.io/service/12513/MF6whgy1_400x400.png',
        configurationPage: () => (
            <>
                <h2>Boba</h2>
            </>
        ),
    },
    {
        key: 'linear5',
        name: 'Segment',
        configurationPath: 'linear',
        description: 'Bring your Highlight comments to Linear as issues.',
        icon: 'https://img.stackshare.io/service/12513/MF6whgy1_400x400.png',
        configurationPage: () => (
            <>
                <h2>Boba</h2>
            </>
        ),
    },
    {
        key: 'linear6',
        name: 'Zapier',
        configurationPath: 'linear',
        description: 'Bring your Highlight comments to Linear as issues.',
        icon: 'https://img.stackshare.io/service/12513/MF6whgy1_400x400.png',
        configurationPage: () => (
            <>
                <h2>Boba</h2>
            </>
        ),
    },
];

export default INTEGRATIONS;
