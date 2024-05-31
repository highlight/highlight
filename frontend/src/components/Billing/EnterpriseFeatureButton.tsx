import { Modal } from '@components/Modal/ModalV2'
import { Box } from '@highlight-run/ui/components'
import PlanComparisonPage from '@pages/Billing/PlanComparisonPage'
import analytics from '@util/analytics'
import React, { PropsWithChildren, useCallback, useState } from 'react'

type Feature = 'Downloading Sessions'

interface Props {
	enabled: boolean
	name: Feature
	fn: () => Promise<any>
	cssClass: string
}

export default function EnterpriseFeatureButton({
	enabled,
	name,
	fn,
	children,
	cssClass,
}: PropsWithChildren<Props>) {
	const [showPlanModal, setShowPlanModal] = useState<boolean>(false)

	const checkFeature = useCallback(async () => {
		if (!enabled) {
			analytics.track(`enterprise-request-${name}`)
			setShowPlanModal(true)
			return
		}
		await fn()
	}, [enabled, name, fn])

	if (showPlanModal) {
		return (
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
						enterprise
					/>
				</Box>
			</Modal>
		)
	}
	return (
		<button className={cssClass} onClick={checkFeature}>
			{children}
		</button>
	)
}
