import { VercelSettingsModalWidth } from '@pages/IntegrationAuthCallback/IntegrationAuthCallbackPage'
import ClearbitIntegrationConfig from '@pages/IntegrationsPage/components/ClearbitIntegration/ClearbitIntegrationConfig'
import DiscordIntegrationConfig from '@pages/IntegrationsPage/components/DiscordIntegration/DiscordIntegrationConfig'
import FrontIntegrationConfig from '@pages/IntegrationsPage/components/FrontIntegration/FrontIntegrationConfig'
import { IntegrationConfigProps } from '@pages/IntegrationsPage/components/Integration'
import LinearIntegrationConfig from '@pages/IntegrationsPage/components/LinearIntegration/LinearIntegrationConfig'
import SlackIntegrationConfig from '@pages/IntegrationsPage/components/SlackIntegration/SlackIntegrationConfig'
import VercelIntegrationConfig from '@pages/IntegrationsPage/components/VercelIntegration/VercelIntegrationConfig'
import ZapierIntegrationConfig from '@pages/IntegrationsPage/components/ZapierIntegration/ZapierIntegrationConfig'
import React from 'react'

export interface Integration {
	key: string
	name: string
	externalLink?: string
	configurationPath: string
	description: string
	defaultEnable?: boolean
	icon?: string
	onlyShowForHighlightAdmin?: boolean
	/**
	 * The page to configure the integration. This can be rendered in a modal or on a different page.
	 */
	configurationPage: (opts: IntegrationConfigProps) => React.ReactNode
	hasSettings: boolean
	modalWidth?: number
}

export const SLACK_INTEGRATION: Integration = {
	key: 'slack',
	name: 'Slack',
	configurationPath: 'slack',
	description:
		'Bring your Highlight comments and alerts to slack as messages.',
	icon: '/images/integrations/slack.jpg',
	configurationPage: (opts) => <SlackIntegrationConfig {...opts} />,
	hasSettings: false,
}

export const LINEAR_INTEGRATION: Integration = {
	key: 'linear',
	name: 'Linear',
	configurationPath: 'linear',
	description: 'Bring your Highlight comments to Linear as issues.',
	icon: '/images/integrations/linear.png',
	configurationPage: (opts) => <LinearIntegrationConfig {...opts} />,
	hasSettings: false,
}

export const ZAPIER_INTEGRATION: Integration = {
	key: 'zapier',
	name: 'Zapier',
	configurationPath: 'zapier',
	onlyShowForHighlightAdmin: true,
	description: 'Use Highlight alerts to trigger a Zap.',
	icon: '/images/integrations/zapier.png',
	configurationPage: (opts) => <ZapierIntegrationConfig {...opts} />,
	hasSettings: false,
}

export const CLEARBIT_INTEGRATION: Integration = {
	key: 'clearbit',
	name: 'Clearbit',
	configurationPath: 'clearbit',
	onlyShowForHighlightAdmin: true,
	description: 'Collect enhanced user analytics.',
	icon: '/images/integrations/clearbit.svg',
	configurationPage: (opts) => <ClearbitIntegrationConfig {...opts} />,
	hasSettings: false,
}

export const FRONT_INTEGRATION: Integration = {
	key: 'front',
	name: 'Front',
	configurationPath: 'front',
	onlyShowForHighlightAdmin: true,
	description: 'Enhance your customer interaction experience.',
	icon: '/images/integrations/front.png',
	configurationPage: (opts) => <FrontIntegrationConfig {...opts} />,
	hasSettings: false,
}

export const VERCEL_INTEGRATION: Integration = {
	key: 'vercel',
	name: 'Vercel',
	configurationPath: 'vercel',
	description: 'Configuration for your Vercel projects.',
	configurationPage: (opts) => <VercelIntegrationConfig {...opts} />,
	hasSettings: true,
	modalWidth: VercelSettingsModalWidth,
}

export const DISCORD_INTEGRATION: Integration = {
	key: 'discord',
	name: 'Discord',
	configurationPath: 'discord',
	onlyShowForHighlightAdmin: true,
	description: 'Bring your Highlight alerts to discord as messages.',
	icon: '/images/integrations/discord.svg',
	configurationPage: (opts) => <DiscordIntegrationConfig {...opts} />,
	hasSettings: false,
}

const INTEGRATIONS: Integration[] = [
	SLACK_INTEGRATION,
	LINEAR_INTEGRATION,
	ZAPIER_INTEGRATION,
	CLEARBIT_INTEGRATION,
	FRONT_INTEGRATION,
	VERCEL_INTEGRATION,
	DISCORD_INTEGRATION,
]

export default INTEGRATIONS
