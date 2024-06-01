import { Modal } from '@components/Modal/ModalV2'
import { Box } from '@highlight-run/ui/components'
import PlanComparisonPage from '@pages/Billing/PlanComparisonPage'
import analytics from '@util/analytics'
import { PropsWithChildren, useCallback, useState } from 'react'

type Feature = 'Session Download' | 'Session CSV Report'

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
	const [showPlanModal, setShowPlanModal] = useState<boolean>(false)

	const checkFeature = useCallback(async () => {
		if (!enabled) {
			analytics.track(`enterprise-request-${name}`)
			setShowPlanModal(true)
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

	if (showPlanModal) {
		return (
			<>
				{action}
				<Modal onClose={() => setShowPlanModal(false)}>
					<Box
						width="full"
						display="flex"
						justifyContent="center"
						flexDirection="column"
						style={{ maxWidth: 900 }}
					>
						<PlanComparisonPage
							setSelectedPlanType={() => {}}
							setStep={() => {}}
							title={`${name} is only available on enterprise plans.`}
							howCanWeHelp={`I would like to use the ${name} feature.`}
							enterprise
						/>
					</Box>
				</Modal>
			</>
		)
	}
	return action
}
