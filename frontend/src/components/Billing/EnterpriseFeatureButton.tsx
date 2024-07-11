import { CalendlyModal } from '@components/CalendlyModal/CalendlyButton'
import { Modal } from '@components/Modal/ModalV2'
import { useGetWorkspaceSettingsQuery } from '@graph/hooks'
import { AllWorkspaceSettings } from '@graph/schemas'
import { Box } from '@highlight-run/ui/components'
import PlanComparisonPage from '@pages/Billing/PlanComparisonPage'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { PropsWithChildren, useCallback, useState } from 'react'

const FEATURE_DESCRIPTIONS = {
	'Session Download': 'download a video .MP4 playback of the session.',
	'Session CSV Report':
		'download a CSV report aggregating all sessions in the results feed.',
	'Multiple Projects': 'create more than 1 project to segment your data.',
	'Custom Team Invites': 'allow manually inviting more than 15 team members.',
	'Custom Team Dashboards': 'allow creating more than 2 dashboards.',
	'Billing Limits': 'limit spending for all highlight data.',
	'Ingestion Sampling': 'control data ingestion rates and sample data.',
	'Custom Data Retention':
		'control data retention beyond the standard 7 days.',
} as const

type Feature = keyof typeof FEATURE_DESCRIPTIONS

interface Props {
	setting: keyof AllWorkspaceSettings
	name: Feature
	fn: () => Promise<any>
	className?: string
	variant?: 'basic'
}

export default function EnterpriseFeatureButton({
	setting,
	name,
	fn,
	children,
	className,
	variant,
}: PropsWithChildren<Props>) {
	const { currentWorkspace } = useApplicationContext()
	const { data, loading } = useGetWorkspaceSettingsQuery({
		variables: {
			workspace_id: currentWorkspace?.id || '',
		},
		skip: !currentWorkspace?.id,
	})

	const [showPlanModal, setShowPlanModal] = useState<
		'features' | 'calendly'
	>()

	const checkFeature = useCallback(async () => {
		if (loading || !data?.workspaceSettings) return
		if (!data.workspaceSettings[setting]) {
			analytics.track(`enterprise-request-${name}`)
			setShowPlanModal('features')
			return
		}
		await fn()
	}, [loading, data?.workspaceSettings, setting, fn, name])

	let action: JSX.Element
	if (variant === 'basic') {
		action = (
			<div className={className} onClick={checkFeature}>
				{children}
			</div>
		)
	} else {
		action = (
			<button className={className} onClick={checkFeature}>
				{children}
			</button>
		)
	}

	if (showPlanModal === 'features') {
		return (
			<>
				{action}
				<Modal
					onClose={() => setShowPlanModal(undefined)}
					title="Upgrade Plan"
				>
					<Box
						width="full"
						display="flex"
						justifyContent="center"
						flexDirection="column"
						style={{ maxWidth: 740 }}
					>
						<PlanComparisonPage
							setSelectedPlanType={() => {}}
							setStep={() => {}}
							title={`${name} ${
								name.endsWith('s') ? 'are' : 'is'
							} only available on enterprise plans.`}
							description={FEATURE_DESCRIPTIONS[name]}
							howCanWeHelp={`I would like to use the ${name} feature.`}
							enterprise
							onClick={() => setShowPlanModal('calendly')}
						/>
					</Box>
				</Modal>
			</>
		)
	} else if (showPlanModal === 'calendly') {
		return (
			<CalendlyModal
				onClose={() => setShowPlanModal(undefined)}
				howCanWeHelp={`I would like to use the ${name} feature.`}
			/>
		)
	}
	return action
}
