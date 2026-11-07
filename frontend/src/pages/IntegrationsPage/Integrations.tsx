import {
	IconSolidClickUp,
	IconSolidGithub,
	IconSolidGitlab,
	IconSolidHeight,
	IconSolidJira,
	IconSolidLinear,
} from '@highlight-run/ui/components'
import { VercelSettingsModalWidth } from '@pages/IntegrationAuthCallback/IntegrationAuthCallbackPage'
import ClearbitIntegrationConfig from '@pages/IntegrationsPage/components/ClearbitIntegration/ClearbitIntegrationConfig'
import ClickUpIntegrationConfig from '@pages/IntegrationsPage/components/ClickUpIntegration/ClickUpIntegrationConfig'
import ClickUpListSelector from '@pages/IntegrationsPage/components/ClickUpIntegration/ClickUpListSelector'
import DiscordIntegrationConfig from '@pages/IntegrationsPage/components/DiscordIntegration/DiscordIntegrationConfig'
import HeightIntegrationConfig from '@pages/IntegrationsPage/components/HeightIntegration/HeightIntegrationConfig'
import HeightListSelector from '@pages/IntegrationsPage/components/HeightIntegration/HeightListSelector'
import { IntegrationConfigProps } from '@pages/IntegrationsPage/components/Integration'
import LinearIntegrationConfig from '@pages/IntegrationsPage/components/LinearIntegration/LinearIntegrationConfig'
import LinearTeamSelector from '@pages/IntegrationsPage/components/LinearIntegration/LinearTeamSelector'
import MicrosoftTeamsIntegrationConfig from '@pages/IntegrationsPage/components/MicrosoftTeamsIntegration/MicrosoftTeamsIntegrationConfig'
import SlackIntegrationConfig from '@pages/IntegrationsPage/components/SlackIntegration/SlackIntegrationConfig'
import VercelIntegrationConfig from '@pages/IntegrationsPage/components/VercelIntegration/VercelIntegrationConfig'
import ZapierIntegrationConfig from '@pages/IntegrationsPage/components/ZapierIntegration/ZapierIntegrationConfig'
import { IssueTrackerIntegration } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import React from 'react'

import GitlabIntegrationConfig from '@/pages/IntegrationsPage/components/GitlabIntegration/GitlabIntegrationConfig'
import GitlabProjectSelector from '@/pages/IntegrationsPage/components/GitlabIntegration/GitlabProjectSelector'
import JiraIntegrationConfig from '@/pages/IntegrationsPage/components/JiraIntegration/JiraIntegrationConfig'
import JiraProjectAndIssueTypeSelector from '@/pages/IntegrationsPage/components/JiraIntegration/JiraProjectSelector'
import ClearbitLogo from '@/static/integrations/clearbit.svg'
import ClickupLogo from '@/static/integrations/clickup.svg'
import CloudflareLogo from '@/static/integrations/cloudflare.svg'
import DiscordLogo from '@/static/integrations/discord.svg'
import GitHubLogo from '@/static/integrations/github.svg'
import GitlabLogo from '@/static/integrations/gitlab.png'
import HeightLogo from '@/static/integrations/height.svg'
import HerokuLogo from '@/static/integrations/heroku.svg'
import JiraLogo from '@/static/integrations/jira.png'
import LinearLogo from '@/static/integrations/linear.png'
import MicrosoftTeamsLogo from '@/static/integrations/microsoft-teams.jpeg'
import SlackLogo from '@/static/integrations/slack.png'
import VercelLogo from '@/static/integrations/vercel-icon-dark.svg'
import ZapierLogo from '@/static/integrations/zapier.png'

import CloudflareIntegrationConfig from './components/CloudflareIntegration/CloudflareIntegration'
import GitHubIntegrationConfig from './components/GitHubIntegration/GitHubIntegrationConfig'
import GitHubRepoSelector from './components/GitHubIntegration/GitHubRepoSelector'
import HerokuIntegrationConfig from './components/HerokuIntegration/HerokuIntegration'

export type NewIntegrationIssueMode = 'create_issue' | 'link_issue'
export enum NewIntegrationIssueType {
	CreateIssue = 'create_issue',
	LinkIssue = 'link_issue',
}

export interface Integration {
	key: string
	name: string
	externalLink?: string
	configurationPath: string
	description: string
	overviewNotes?: string[]
	defaultEnable?: boolean
	icon: string
	noRoundedIcon?: boolean
	onlyShowForHighlightAdmin?: boolean
	allowlistWorkspaceIds?: Array<string>
	isProjectLevel?: boolean

	/**
	 * The page to configure the integration. This can be rendered in a modal or on a different page.
	 */
	configurationPage: (opts: IntegrationConfigProps) => React.ReactNode
	hasSettings: boolean
	modalWidth?: number
	docs?: string
}

/**
 * Extracts a concise hostname label from an integration's external URL for the metadata header.
 */
export const resolveIntegrationExternalDomain = (
	integration: Integration,
): string => {
	if (!integration.externalLink) {
		return `${integration.key}.com`
	}
	return integration.externalLink
		.replace(/^https?:\/\/(www\.)?/, '')
		.split('/')[0]
}

export const SLACK_INTEGRATION: Integration = {
	key: 'slack',
	name: 'Slack',
	externalLink: 'https://slack.com',
	docs: 'https://www.highlight.io/docs/general/integrations/slack-integration',
	configurationPath: 'slack',
	description:
		'Bring your highlight.io comments and alerts to Slack as messages.',
	overviewNotes: [
		'Connect your Highlight workspace with Slack to deliver real-time session, error, log, and metric alerts directly to your engineering channels.',
		'Tag teammates in session and error comments to notify them in Slack with deep links back to the exact timestamp and stacktrace.',
	],
	icon: SlackLogo,
	configurationPage: (opts) => <SlackIntegrationConfig {...opts} />,
	hasSettings: false,
	isProjectLevel: true,
}

export const MICROSOFT_TEAMS_INTEGRATION: Integration = {
	key: 'microsoft_teams',
	name: 'Microsoft Teams',
	externalLink: 'https://microsoft.com',
	docs: 'https://www.highlight.io/docs/general/integrations/microsoft-teams-integration',
	configurationPath: 'microsoft_teams',
	description: 'Receive highlight.io alerts via Microsoft Teams messages.',
	overviewNotes: [
		'Route Highlight error, session, log, and trace alerts directly into your Microsoft Teams channels.',
		'Keep incident response workflows synchronized across your organization with automated channel notifications.',
	],
	icon: MicrosoftTeamsLogo,
	configurationPage: (opts) => <MicrosoftTeamsIntegrationConfig {...opts} />,
	hasSettings: false,
	isProjectLevel: true,
}

export const HEROKU_INTEGRATION: Integration = {
	key: 'heroku',
	name: 'Heroku',
	externalLink: 'https://heroku.com',
	docs: 'https://www.highlight.io/docs/general/integrations/heroku-integration',
	configurationPath: 'heroku',
	description: 'Setup a Heroku Log Drain.',
	overviewNotes: [
		'Forward application and dyno logs from Heroku to Highlight using a Syslog TLS log drain.',
		'Correlate backend Heroku logs with frontend session replays and distributed traces out of the box.',
	],
	icon: HerokuLogo,
	configurationPage: (opts) => <HerokuIntegrationConfig {...opts} />,
	hasSettings: false,
	isProjectLevel: true,
}

export const CLOUDFLARE_INTEGRATION: Integration = {
	key: 'cloudflare',
	name: 'Cloudflare',
	externalLink: 'https://cloudflare.com',
	docs: 'https://www.highlight.io/docs/general/integrations/cloudflare-integration',
	configurationPath: 'cloudflare',
	description: 'Setup a Cloudflare Proxy.',
	overviewNotes: [
		'Configure a first-party Cloudflare proxy subdomain to route Highlight telemetry through your own domain.',
		'Prevent ad-blockers from dropping session replay and error monitoring payloads in production.',
	],
	icon: CloudflareLogo,
	configurationPage: (opts) => <CloudflareIntegrationConfig {...opts} />,
	hasSettings: true,
	modalWidth: VercelSettingsModalWidth,
	isProjectLevel: false,
}

export const LINEAR_INTEGRATION: IssueTrackerIntegration = {
	key: 'linear',
	name: 'Linear',
	externalLink: 'https://linear.app',
	docs: 'https://www.highlight.io/docs/general/integrations/linear-integration',
	configurationPath: 'linear',
	description: 'Bring your highlight.io comments to Linear as issues.',
	overviewNotes: [
		'Create and link Linear issues directly from Highlight error groups and session replay comments.',
		'Keep engineering triage synchronized with bidirectional links to session replays and stacktraces.',
	],
	icon: LinearLogo,
	configurationPage: (opts) => <LinearIntegrationConfig {...opts} />,
	hasSettings: false,
	isProjectLevel: true,
	containerLabel: 'team',
	issueLabel: 'issue',
	containerSelection: (opts) => <LinearTeamSelector {...opts} />,
	Icon: IconSolidLinear,
}

export const JIRA_INTEGRATION: IssueTrackerIntegration = {
	key: 'jira',
	name: 'Jira',
	externalLink: 'https://atlassian.com',
	docs: 'https://www.highlight.io/docs/general/integrations/jira-integration',
	configurationPath: 'jira',
	description: 'Bring your highlight.io comments to Jira as issues.',
	overviewNotes: [
		'File Jira tickets with attached session replay context and stacktraces directly from Highlight errors and comments.',
		'Link existing Jira issues to recurring errors so your team can track resolution progress in one place.',
	],
	icon: JiraLogo,
	configurationPage: (opts) => <JiraIntegrationConfig {...opts} />,
	hasSettings: false,
	isProjectLevel: true,
	containerLabel: 'team',
	issueLabel: 'issue',
	containerSelection: (opts) => <JiraProjectAndIssueTypeSelector {...opts} />,
	Icon: IconSolidJira,
}

export const GITLAB_INTEGRATION: IssueTrackerIntegration = {
	key: 'gitlab',
	name: 'GitLab',
	externalLink: 'https://gitlab.com',
	docs: 'https://www.highlight.io/docs/general/integrations/gitlab-integration',
	configurationPath: 'gitlab',
	description: 'Bring your highlight.io comments to GitLab as issues.',
	overviewNotes: [
		'Create GitLab issues directly from Highlight error reports and session replay discussions.',
		'Connect your GitLab projects to streamline bug reporting with full reproduction context.',
	],
	icon: GitlabLogo,
	configurationPage: (opts) => <GitlabIntegrationConfig {...opts} />,
	hasSettings: false,
	isProjectLevel: true,
	containerLabel: 'team',
	issueLabel: 'issue',
	containerSelection: (opts) => <GitlabProjectSelector {...opts} />,
	Icon: IconSolidGitlab,
}

export const ZAPIER_INTEGRATION: Integration = {
	key: 'zapier',
	name: 'Zapier',
	externalLink: 'https://zapier.com',
	docs: 'https://www.highlight.io/docs/general/integrations/zapier-integration',
	configurationPath: 'zapier',
	onlyShowForHighlightAdmin: true,
	description: 'Use highlight.io alerts to trigger a Zap.',
	overviewNotes: [
		'Connect Highlight alerts to thousands of downstream tools by triggering automated Zaps whenever an alert fires.',
		'Generate a project-scoped access token to authenticate your Highlight trigger inside Zapier.',
	],
	icon: ZapierLogo,
	configurationPage: (opts) => <ZapierIntegrationConfig {...opts} />,
	hasSettings: false,
	isProjectLevel: true,
}

export const CLEARBIT_INTEGRATION: Integration = {
	key: 'clearbit',
	name: 'Clearbit',
	externalLink: 'https://clearbit.com',
	docs: 'https://www.highlight.io/docs/general/integrations/clearbit-integration',
	configurationPath: 'clearbit',
	description: 'Collect enhanced user analytics.',
	overviewNotes: [
		'Automatically enrich identified user sessions with company and social profile metadata powered by Clearbit.',
		'Surface organization attributes directly inside the Highlight session replay metadata pane.',
	],
	icon: ClearbitLogo,
	configurationPage: (opts) => <ClearbitIntegrationConfig {...opts} />,
	hasSettings: false,
	isProjectLevel: true,
}

export const VERCEL_INTEGRATION: Integration = {
	key: 'vercel',
	name: 'Vercel',
	externalLink: 'https://vercel.com',
	docs: 'https://www.highlight.io/docs/general/integrations/vercel-integration',
	configurationPath: 'vercel',
	description: 'Configuration for your Vercel projects.',
	overviewNotes: [
		'The Vercel integration automatically injects your Highlight environment variables and configures log drains and source map uploads for your Vercel deployments.',
		'Map each Vercel project to its corresponding Highlight project to capture serverless logs and de-minify production stacktraces.',
	],
	configurationPage: (opts) => <VercelIntegrationConfig {...opts} />,
	icon: VercelLogo,
	noRoundedIcon: true,
	hasSettings: true,
	modalWidth: VercelSettingsModalWidth,
	isProjectLevel: true,
}

export const DISCORD_INTEGRATION: Integration = {
	key: 'discord',
	name: 'Discord',
	externalLink: 'https://discord.com',
	docs: 'https://www.highlight.io/docs/general/integrations/discord-integration',
	configurationPath: 'discord',
	description: 'Bring your highlight.io alerts to Discord as messages.',
	overviewNotes: [
		'Deliver real-time Highlight error, session, log, and metric alerts directly to your Discord server channels.',
		'Jump straight from Discord alert notifications into the affected session replay or error stacktrace.',
	],
	icon: DiscordLogo,
	configurationPage: (opts) => <DiscordIntegrationConfig {...opts} />,
	hasSettings: false,
	isProjectLevel: true,
}

export const CLICKUP_INTEGRATION: IssueTrackerIntegration = {
	key: 'clickup',
	name: 'ClickUp',
	externalLink: 'https://clickup.com',
	docs: 'https://www.highlight.io/docs/general/integrations/clickup-integration',
	configurationPath: 'clickup',
	description: 'Create ClickUp tasks from your highlight.io comments.',
	overviewNotes: [
		'Turn Highlight session comments and error reports into actionable ClickUp tasks in seconds.',
		'Map your Highlight projects to specific ClickUp spaces and lists for structured issue tracking.',
	],
	configurationPage: (opts) => <ClickUpIntegrationConfig {...opts} />,
	icon: ClickupLogo,
	hasSettings: true,
	modalWidth: 672,
	isProjectLevel: true,
	containerLabel: 'list',
	issueLabel: 'task',
	containerSelection: (opts) => <ClickUpListSelector {...opts} />,
	Icon: IconSolidClickUp,
}

export const HEIGHT_INTEGRATION: IssueTrackerIntegration = {
	key: 'height',
	name: 'Height',
	externalLink: 'https://height.app',
	docs: 'https://www.highlight.io/docs/general/integrations/height-integration',
	configurationPath: 'height',
	description: 'Create Height tasks from your highlight.io comments.',
	overviewNotes: [
		'Create and link Height tasks directly from Highlight session comments and error occurrences.',
		'Configure which Height lists are available to each project in your Highlight workspace.',
	],
	configurationPage: (opts) => <HeightIntegrationConfig {...opts} />,
	icon: HeightLogo,
	hasSettings: true,
	modalWidth: 672,
	isProjectLevel: true,
	containerLabel: 'list',
	issueLabel: 'task',
	containerSelection: (opts) => <HeightListSelector {...opts} />,
	Icon: IconSolidHeight,
}

export const GITHUB_INTEGRATION: IssueTrackerIntegration = {
	key: 'github',
	name: 'GitHub',
	externalLink: 'https://github.com',
	docs: 'https://www.highlight.io/docs/general/integrations/github-integration',
	configurationPath: 'github',
	description:
		'Create GitHub issues from comments and enhance your stacktraces.',
	overviewNotes: [
		'Connect your GitHub repositories to enrich error stacktraces with inline source code context and commit blame metadata.',
		'Create and link GitHub issues directly from Highlight errors and session replay comments.',
	],
	configurationPage: (opts) => <GitHubIntegrationConfig {...opts} />,
	icon: GitHubLogo,
	hasSettings: false,
	isProjectLevel: true,
	containerLabel: 'repo',
	issueLabel: 'issue',
	containerSelection: (opts) => <GitHubRepoSelector {...opts} />,
	Icon: IconSolidGithub,
}

const INTEGRATIONS: Integration[] = [
	SLACK_INTEGRATION,
	LINEAR_INTEGRATION,
	ZAPIER_INTEGRATION,
	CLEARBIT_INTEGRATION,
	VERCEL_INTEGRATION,
	DISCORD_INTEGRATION,
	CLICKUP_INTEGRATION,
	HEIGHT_INTEGRATION,
	GITHUB_INTEGRATION,
	JIRA_INTEGRATION,
	MICROSOFT_TEAMS_INTEGRATION,
	GITLAB_INTEGRATION,
	HEROKU_INTEGRATION,
	CLOUDFLARE_INTEGRATION,
]

export default INTEGRATIONS
