import { CalendlyModal } from '@components/CalendlyModal/CalendlyButton'
import { Modal } from '@components/Modal/ModalV2'
import { Box } from '@highlight-run/ui/components'
import PlanComparisonPage from '@pages/Billing/PlanComparisonPage'
import analytics from '@util/analytics'
import { PropsWithChildren, useCallback, useState } from 'react'

type Feature = 'Session Download' | 'Session CSV Report'

const FEATURE_DESCRIPTIONS = {
	'Session Download': 'Download a video .MP4 playback of the session.',
	'Session CSV Report':
		'Download a CSV report aggregating all sessions in the results feed.',
} as { [K in Feature]: string }

interface Props {
	enabled: boolean | 'force'
	name: Feature
	fn: () => Promise<any>
	className?: string
	variant?: 'basic'
}

export default function EnterpriseFeatureButton({
	enabled,
	name,
	fn,
	children,
	className,
	variant,
}: PropsWithChildren<Props>) {
	const [showPlanModal, setShowPlanModal] = useState<
		'features' | 'calendly'
	>()

	const checkFeature = useCallback(async () => {
		if (!enabled) {
			analytics.track(`enterprise-request-${name}`)
			setShowPlanModal('features')
			return
		}
		await fn()
	}, [enabled, fn, name])

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
							title={`${name} is only available on enterprise plans.`}
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
