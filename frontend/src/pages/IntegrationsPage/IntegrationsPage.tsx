     1|import { useAuthContext } from '@authentication/AuthContext'
     2|import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
     3|import LeadAlignLayout from '@components/layout/LeadAlignLayout'
     4|import { useClearbitIntegration } from '@pages/IntegrationsPage/components/ClearbitIntegration/utils'
     5|import { useClickUpIntegration } from '@pages/IntegrationsPage/components/ClickUpIntegration/utils'
     6|import { useCloudflareIntegration } from '@pages/IntegrationsPage/components/CloudflareIntegration/utils'
     7|import { useDiscordIntegration } from '@pages/IntegrationsPage/components/DiscordIntegration/utils'
     8|import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
     9|import { useHeightIntegration } from '@pages/IntegrationsPage/components/HeightIntegration/utils'
    10|import { useHerokuIntegration } from '@pages/IntegrationsPage/components/HerokuIntegration/utils'
    11|import Integration from '@pages/IntegrationsPage/components/Integration'
    12|import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
    13|import { useVercelIntegration } from '@pages/IntegrationsPage/components/VercelIntegration/utils'
    14|import { useZapierIntegration } from '@pages/IntegrationsPage/components/ZapierIntegration/utils'
    15|import INTEGRATIONS from '@pages/IntegrationsPage/Integrations'
    16|import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
    17|import analytics from '@util/analytics'
    18|import { useParams } from '@util/react-router/useParams'
    19|import { useEffect, useMemo, useState } from 'react'
    20|import { Helmet } from 'react-helmet'
    21|import { StringParam, useQueryParam } from 'use-query-params'
    22|
    23|import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
    24|import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
    25|import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'
    26|
    27|import layoutStyles from '../../components/layout/LeadAlignLayout.module.css'
    28|import styles from './IntegrationsPage.module.css'
    29|
    30|const IntegrationsPage = () => {
    31|	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()
    32|
    33|	const { integration_type: configureIntegration } = useParams<{
    34|		integration_type: string
    35|	}>()
    36|
    37|	const [popUpModal] = useQueryParam('enable', StringParam)
    38|
    39|	const { isHighlightAdmin } = useAuthContext()
    40|	const { currentWorkspace } = useApplicationContext()
    41|
    42|	const { isLinearIntegratedWithProject, loading: loadingLinear } =
    43|		useLinearIntegration()
    44|
    45|	const { isZapierIntegratedWithProject, loading: loadingZapier } =
    46|		useZapierIntegration()
    47|
    48|	const { isClearbitIntegratedWithWorkspace, loading: loadingClearbit } =
    49|		useClearbitIntegration()
    50|
    51|	const { isVercelIntegratedWithProject, loading: loadingVercel } =
    52|		useVercelIntegration()
    53|
    54|	const { isDiscordIntegratedWithProject, loading: loadingDiscord } =
    55|		useDiscordIntegration()
    56|
    57|	const { isHerokuConnectedToWorkspace, loading: loadingHeroku } =
    58|		useHerokuIntegration()
    59|
    60|	const { isCloudflareConnectedToWorkspace, loading: loadingCloudflare } =
    61|		useCloudflareIntegration()
    62|
    63|	const {
    64|		isMicrosoftTeamsConnectedToWorkspace,
    65|		loading: loadingMicrosoftTeams,
    66|	} = useMicrosoftTeamsBot()
    67|
    68|	const {
    69|		settings: {
    70|			isIntegrated: isJiraIntegratedWithProject,
    71|			loading: loadingJira,
    72|		},
    73|	} = useJiraIntegration()
    74|
    75|	const {
    76|		settings: {
    77|			isIntegrated: isGitlabIntegratedWithProject,
    78|			loading: loadingGitlab,
    79|		},
    80|	} = useGitlabIntegration()
    81|
    82|	const {
    83|		settings: {
    84|			isIntegrated: isGitHubIntegratedWithProject,
    85|			loading: loadingGitHub,
    86|		},
    87|	} = useGitHubIntegration()
    88|
    89|	const {
    90|		settings: {
    91|			isIntegrated: isClickUpIntegratedWithProject,
    92|			loading: loadingClickUp,
    93|		},
    94|	} = useClickUpIntegration()
    95|
    96|	const {
    97|		settings: {
    98|			isIntegrated: isHeightIntegratedWithProject,
    99|			loading: loadingHeight,
   100|		},
   101|	} = useHeightIntegration()
   102|
   103|	const loading =
   104|		loadingLinear ||
   105|		loadingSlack ||
   106|		loadingZapier ||
   107|		loadingClearbit ||
   108|		loadingVercel ||
   109|		loadingDiscord ||
   110|		loadingClickUp ||
   111|		loadingHeight ||
   112|		loadingGitHub ||
   113|		loadingJira ||
   114|		loadingGitlab ||
   115|		loadingMicrosoftTeams ||
   116|		loadingHeroku ||
   117|		loadingCloudflare
   118|
   119|	const integrations = useMemo(() => {
   120|		return INTEGRATIONS.filter((integration) => {
   121|			if (
   122|				integration.allowlistWorkspaceIds ||
   123|				integration.onlyShowForHighlightAdmin
   124|			) {
   125|				let canSee = false
   126|
   127|				const workspaceID = currentWorkspace?.id
   128|
   129|				if (integration.allowlistWorkspaceIds && workspaceID) {
   130|					canSee =
   131|						canSee ||
   132|						integration.allowlistWorkspaceIds?.includes(workspaceID)
   133|				}
   134|
   135|				if (integration.onlyShowForHighlightAdmin) {
   136|					canSee = canSee || isHighlightAdmin
   137|				}
   138|				return canSee
   139|			} else {
   140|				return true
   141|			}
   142|		}).map((inter) => ({
   143|			...inter,
   144|			defaultEnable:
   145|				(inter.key === 'slack' && isSlackConnectedToWorkspace) ||
   146|				(inter.key === 'linear' && isLinearIntegratedWithProject) ||
   147|				(inter.key === 'zapier' && isZapierIntegratedWithProject) ||
   148|				(inter.key === 'clearbit' &&
   149|					isClearbitIntegratedWithWorkspace) ||
   150|				(inter.key === 'vercel' && isVercelIntegratedWithProject) ||
   151|				(inter.key === 'discord' && isDiscordIntegratedWithProject) ||
   152|				(inter.key === 'github' && isGitHubIntegratedWithProject) ||
   153|				(inter.key === 'clickup' && isClickUpIntegratedWithProject) ||
   154|				(inter.key === 'height' && isHeightIntegratedWithProject) ||
   155|				(inter.key === 'jira' && isJiraIntegratedWithProject) ||
   156|				(inter.key === 'microsoft_teams' &&
   157|					isMicrosoftTeamsConnectedToWorkspace) ||
   158|				(inter.key === 'gitlab' && isGitlabIntegratedWithProject) ||
   159|				(inter.key === 'heroku' && isHerokuConnectedToWorkspace) ||
   160|				(inter.key === 'cloudflare' &&
   161|					isCloudflareConnectedToWorkspace),
   162|		}))
   163|	}, [
   164|		currentWorkspace?.id,
   165|		isHighlightAdmin,
   166|		isSlackConnectedToWorkspace,
   167|		isLinearIntegratedWithProject,
   168|		isZapierIntegratedWithProject,
   169|		isClearbitIntegratedWithWorkspace,
   170|		isVercelIntegratedWithProject,
   171|		isDiscordIntegratedWithProject,
   172|		isGitHubIntegratedWithProject,
   173|		isClickUpIntegratedWithProject,
   174|		isHeightIntegratedWithProject,
   175|		isJiraIntegratedWithProject,
   176|		isMicrosoftTeamsConnectedToWorkspace,
   177|		isGitlabIntegratedWithProject,
   178|		isHerokuConnectedToWorkspace,
   179|		isCloudflareConnectedToWorkspace,
   180|	])
   181|
   182|	const [searchQuery, setSearchQuery] = useState('')
   183|
   184|	const filteredIntegrations = useMemo(() => {
   185|		if (!searchQuery.trim()) return integrations
   186|		const q = searchQuery.toLowerCase()
   187|		return integrations.filter(
   188|			(integration) =>
   189|				integration.name.toLowerCase().includes(q) ||
   190|				integration.description?.toLowerCase().includes(q),
   191|		)
   192|	}, [integrations, searchQuery])
   193|
   194|	useEffect(() => analytics.page('Integrations'), [])
   195|
   196|	return (
   197|		<>
   198|			<Helmet>
   199|				<title>Integrations</title>
   200|			</Helmet>
   201|			<LeadAlignLayout>
   202|				<div className={styles.pageHeader}>
   203|					<div>
   204|						<h2 className={styles.pageTitle}>Integrations</h2>
   205|						<p className={layoutStyles.subTitle}>
   206|							Supercharge your workflows and attach Highlight with
   207|							the tools you use everyday.
   208|						</p>
   209|					</div>
   210|					<input
   211|						type="text"
   212|						className={styles.searchInput}
   213|						placeholder="Search integrations..."
   214|						value={searchQuery}
   215|						onChange={(e) => setSearchQuery(e.target.value)}
   216|					/>
   217|				</div>
   218|				<div className={styles.integrationsContainer}>
   219|					{filteredIntegrations.length > 0 ? (
   220|						filteredIntegrations.map((integration) => (
   221|							<Integration
   222|								integration={integration}
   223|								key={integration.key}
   224|								showModalDefault={
   225|									popUpModal === integration.key
   226|								}
   227|								showSettingsDefault={
   228|									configureIntegration === integration.key
   229|								}
   230|								loading={loading}
   231|							/>
   232|						))
   233|					) : (
   234|						<div className={styles.emptyState}>
   235|							{searchQuery
   236|								? `No integrations found matching "${searchQuery}".`
   237|								: 'No integrations available.'}
   238|						</div>
   239|					)}
   240|				</div>
   241|			</LeadAlignLayout>
   242|		</>
   243|	)
   244|}
   245|
   246|export default IntegrationsPage
   247|