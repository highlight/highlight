import { useAuthContext } from '@authentication/AuthContext'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import { Skeleton } from '@components/Skeleton/Skeleton'
import { useClearbitIntegration } from '@pages/IntegrationsPage/components/ClearbitIntegration/utils'
import { useClickUpIntegration } from '@pages/IntegrationsPage/components/ClickUpIntegration/utils'
import { useDiscordIntegration } from '@pages/IntegrationsPage/components/DiscordIntegration/utils'
import { useFrontIntegration } from '@pages/IntegrationsPage/components/FrontIntegration/utils'
import { useHeightIntegration } from '@pages/IntegrationsPage/components/HeightIntegration/utils'
import Integration from '@pages/IntegrationsPage/components/Integration'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { useVercelIntegration } from '@pages/IntegrationsPage/components/VercelIntegration/utils'
import { useZapierIntegration } from '@pages/IntegrationsPage/components/ZapierIntegration/utils'
import INTEGRATIONS from '@pages/IntegrationsPage/Integrations'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParam } from 'use-query-params'

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss'
import styles from './IntegrationsPage.module.scss'

const IntegrationsPage = () => {
	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()

	const { integration_type: configureIntegration } = useParams<{
		integration_type: string
	}>()

	const [popUpModal] = useQueryParam('enable', StringParam)

	const { isHighlightAdmin } = useAuthContext()

	const { isLinearIntegratedWithProject, loading: loadingLinear } =
		useLinearIntegration()

	const { isZapierIntegratedWithProject, loading: loadingZapier } =
		useZapierIntegration()

	const { isClearbitIntegratedWithWorkspace, loading: loadingClearbit } =
		useClearbitIntegration()

	const { isFrontIntegratedWithProject, loading: loadingFront } =
		useFrontIntegration()

	const { isVercelIntegratedWithProject, loading: loadingVercel } =
		useVercelIntegration()

	const { isDiscordIntegratedWithProject, loading: loadingDiscord } =
		useDiscordIntegration()

	const {
		settings: {
			isIntegrated: isClickUpIntegratedWithProject,
			loading: loadingClickUp,
		},
	} = useClickUpIntegration()

	const {
		settings: {
			isIntegrated: isHeightIntegratedWithProject,
			loading: loadingHeight,
		},
	} = useHeightIntegration()

	const loading =
		loadingLinear ||
		loadingSlack ||
		loadingZapier ||
		loadingClearbit ||
		loadingFront ||
		loadingVercel ||
		loadingDiscord ||
		loadingClickUp ||
		loadingHeight

	const integrations = useMemo(() => {
		return INTEGRATIONS.filter((inter) =>
			inter.onlyShowForHighlightAdmin ? isHighlightAdmin : true,
		).map((inter) => ({
			...inter,
			defaultEnable:
				(inter.key === 'slack' && isSlackConnectedToWorkspace) ||
				(inter.key === 'linear' && isLinearIntegratedWithProject) ||
				(inter.key === 'zapier' && isZapierIntegratedWithProject) ||
				(inter.key === 'clearbit' &&
					isClearbitIntegratedWithWorkspace) ||
				(inter.key === 'front' && isFrontIntegratedWithProject) ||
				(inter.key === 'vercel' && isVercelIntegratedWithProject) ||
				(inter.key === 'discord' && isDiscordIntegratedWithProject) ||
				(inter.key === 'clickup' && isClickUpIntegratedWithProject) ||
				(inter.key === 'height' && isHeightIntegratedWithProject),
		}))
	}, [
		isHighlightAdmin,
		isSlackConnectedToWorkspace,
		isLinearIntegratedWithProject,
		isZapierIntegratedWithProject,
		isClearbitIntegratedWithWorkspace,
		isFrontIntegratedWithProject,
		isVercelIntegratedWithProject,
		isDiscordIntegratedWithProject,
		isClickUpIntegratedWithProject,
		isHeightIntegratedWithProject,
	])

	useEffect(() => analytics.page(), [])

	return (
		<>
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<LeadAlignLayout>
				<h2>Integrations</h2>
				<p className={layoutStyles.subTitle}>
					Supercharge your workflows and attach Highlight with the
					tools you use everyday.
				</p>
				<div className={styles.integrationsContainer}>
					{integrations.map((integration) =>
						loading ? (
							<Skeleton height={187} key={integration.key} />
						) : (
							<Integration
								integration={integration}
								key={integration.key}
								showModalDefault={
									popUpModal === integration.key
								}
								showSettingsDefault={
									configureIntegration === integration.key
								}
							/>
						),
					)}
				</div>
			</LeadAlignLayout>
		</>
	)
}

export default IntegrationsPage
