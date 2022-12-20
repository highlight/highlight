import { VercelSettingsModalWidth } from '@pages/IntegrationAuthCallback/IntegrationAuthCallbackPage'
import ClearbitIntegrationConfig from '@pages/IntegrationsPage/components/ClearbitIntegration/ClearbitIntegrationConfig'
import ClickUpIntegrationConfig from '@pages/IntegrationsPage/components/ClickUpIntegration/ClickUpIntegrationConfig'
import ClickUpListSelector from '@pages/IntegrationsPage/components/ClickUpIntegration/ClickUpListSelector'
import DiscordIntegrationConfig from '@pages/IntegrationsPage/components/DiscordIntegration/DiscordIntegrationConfig'
import FrontIntegrationConfig from '@pages/IntegrationsPage/components/FrontIntegration/FrontIntegrationConfig'
import FrontPluginConfig from '@pages/IntegrationsPage/components/FrontPlugin/FrontPluginConfig'
import { IntegrationConfigProps } from '@pages/IntegrationsPage/components/Integration'
import LinearIntegrationConfig from '@pages/IntegrationsPage/components/LinearIntegration/LinearIntegrationConfig'
import LinearTeamSelector from '@pages/IntegrationsPage/components/LinearIntegration/LinearTeamSelector'
import SlackIntegrationConfig from '@pages/IntegrationsPage/components/SlackIntegration/SlackIntegrationConfig'
import VercelIntegrationConfig from '@pages/IntegrationsPage/components/VercelIntegration/VercelIntegrationConfig'
import ZapierIntegrationConfig from '@pages/IntegrationsPage/components/ZapierIntegration/ZapierIntegrationConfig'
import { IssueTrackerIntegration } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import React from 'react'

export interface Integration {
	key: string
	name: string
	externalLink?: string
	configurationPath: string
	description: string
	defaultEnable?: boolean
	icon: string
	noRoundedIcon?: boolean
	onlyShowForHighlightAdmin?: boolean
	/**
	 * The page to configure the integration. This can be rendered in a modal or on a different page.
	 */
	configurationPage: (opts: IntegrationConfigProps) => React.ReactNode
	hasSettings: boolean
	modalWidth?: number
	docs?: string
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

export const LINEAR_INTEGRATION: IssueTrackerIntegration = {
	key: 'linear',
	name: 'Linear',
	configurationPath: 'linear',
	description: 'Bring your Highlight comments to Linear as issues.',
	icon: '/images/integrations/linear.png',
	configurationPage: (opts) => <LinearIntegrationConfig {...opts} />,
	hasSettings: false,
	containerLabel: 'team',
	issueLabel: 'issue',
	containerSelection: (opts) => <LinearTeamSelector {...opts} />,
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
	description: 'Collect enhanced user analytics.',
	icon: '/images/integrations/clearbit.svg',
	configurationPage: (opts) => <ClearbitIntegrationConfig {...opts} />,
	hasSettings: false,
	docs: 'https://www.highlight.io/docs/integrations/clearbit-integration',
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

export const FRONT_PLUGIN: Integration = {
	key: 'front',
	name: 'Front',
	configurationPath: 'front',
	description: 'Enhance your customer interaction experience.',
	icon: '/images/integrations/front.png',
	configurationPage: (opts) => <FrontPluginConfig {...opts} />,
	hasSettings: false,
}

export const VERCEL_INTEGRATION: Integration = {
	key: 'vercel',
	name: 'Vercel',
	configurationPath: 'vercel',
	description: 'Configuration for your Vercel projects.',
	configurationPage: (opts) => <VercelIntegrationConfig {...opts} />,
	icon: '/images/integrations/vercel-icon-dark.svg',
	noRoundedIcon: true,
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

export const CLICKUP_INTEGRATION: IssueTrackerIntegration = {
	key: 'clickup',
	name: 'ClickUp',
	configurationPath: 'clickup',
	onlyShowForHighlightAdmin: true,
	description: 'Create ClickUp tasks from your Highlight comments.',
	configurationPage: (opts) => <ClickUpIntegrationConfig {...opts} />,
	icon: '/images/integrations/clickup.svg',
	hasSettings: true,
	modalWidth: 672,
	containerLabel: 'list',
	issueLabel: 'task',
	containerSelection: (opts) => <ClickUpListSelector {...opts} />,
}

const INTEGRATIONS: Integration[] = [
	SLACK_INTEGRATION,
	LINEAR_INTEGRATION,
	ZAPIER_INTEGRATION,
	CLEARBIT_INTEGRATION,
	FRONT_PLUGIN,
	VERCEL_INTEGRATION,
	DISCORD_INTEGRATION,
	CLICKUP_INTEGRATION,
]

export default INTEGRATIONS
