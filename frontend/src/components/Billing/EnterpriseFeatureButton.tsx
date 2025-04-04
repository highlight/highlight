import { CalendlyModal } from '@components/CalendlyModal/CalendlyButton'
import { Modal } from '@components/Modal/ModalV2'
import {
	useGetBillingDetailsQuery,
	useGetWorkspaceSettingsQuery,
} from '@graph/hooks'
import { AllWorkspaceSettings } from '@graph/schemas'
import { Box } from '@highlight-run/ui/components'
import PlanComparisonPage from '@pages/Billing/PlanComparisonPage'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { PropsWithChildren, useCallback, useState, type JSX } from 'react'

const FEATURE_DESCRIPTIONS = {
	'Session Download': 'download a video .MP4 playback of the session.',
	'Session CSV Report':
		'download a CSV report aggregating all sessions in the results feed.',
	'More than 1 project': 'create more than 1 project to segment your data.',
	'More than 15 team members':
		'allow manually inviting more than 15 team members.',
	'More than 3 dashboards': 'allow creating more than 3 dashboards.',
	'Ingestion Limits': 'control data ingestion filters.',
	'Ingestion Sampling': 'control data ingestion rates and sample data.',
	'Custom Data Retention':
		'control data retention beyond the standard retention.',
	'Jira Integration':
		'create Jira issues from your highlight.io errors and sessions.',
	'Teams Integration':
		'receive highlight.io alerts via Microsoft Teams messages.',
	'Single Sign-On (SSO)':
		'enable SSO to streamline authentication for your organization.',
} as const

type Feature = keyof typeof FEATURE_DESCRIPTIONS

interface Props {
	setting: keyof AllWorkspaceSettings
	name: Feature
	fn: () => any
	onShowModal?: () => void
	onClose?: () => void
	className?: string
	variant?: 'basic'
	shown?: true
	disabled?: boolean
}

export default function EnterpriseFeatureButton({
	setting,
	name,
	fn,
	children,
	className,
	variant,
	onShowModal,
	onClose,
	shown,
	disabled,
}: PropsWithChildren<Props>) {
	const { currentWorkspace } = useApplicationContext()
	const { data, loading } = useGetWorkspaceSettingsQuery({
		variables: {
			workspace_id: currentWorkspace?.id || '',
		},
		skip: !currentWorkspace?.id,
	})

	// prefetch the query used by subpages
	useGetBillingDetailsQuery({
		variables: {
			workspace_id: currentWorkspace?.id || '',
		},
		skip: !currentWorkspace?.id,
	})

	const [showPlanModal, setShowPlanModal] = useState<
		'features' | 'calendly' | undefined
	>(shown ? 'features' : undefined)

	const checkFeature = useCallback(async () => {
		if (loading || !data?.workspaceSettings || disabled) return
		if (!data.workspaceSettings[setting]) {
			analytics.track(`enterprise-request-${name}`)
			if (onShowModal) {
				onShowModal()
			}
			setShowPlanModal('features')
			return
		}
		await fn()
	}, [
		loading,
		data?.workspaceSettings,
		disabled,
		setting,
		fn,
		name,
		onShowModal,
	])

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
					onClose={() => {
						setShowPlanModal(undefined)
						if (onClose) onClose()
					}}
					title="Upgrade Plan"
				>
					<Box
						width="full"
						display="flex"
						justifyContent="center"
						flexDirection="column"
						style={{ maxWidth: 640 }}
					>
						<PlanComparisonPage
							setSelectedPlanType={() => {}}
							setStep={() => {}}
							title={`${name} ${
								name.endsWith('s') ? 'are' : 'is'
							} not available on your current plan.`}
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
