import { toast } from '@components/Toaster'
import analytics from '@util/analytics'
import { showSupportMessage } from '@util/window'
import { PropsWithChildren, useCallback, useEffect } from 'react'

type Feature = 'Downloading Sessions'

interface Props {
	enabled: boolean
	name: Feature
	fn: () => Promise<any>
}

export default function EnterpriseFeature({
	enabled,
	name,
	fn,
	children,
}: PropsWithChildren<Props>) {
	const checkFeature = useCallback(async () => {
		if (!enabled) {
			analytics.track(`enterprise-request-${name}`)
			await toast.warning(
				`${name} is only available on enterprise plans.`,
			)
			await showSupportMessage(
				`Hi! I would like to use the ${name} feature.`,
			)
			return
		}
		await fn()
	}, [enabled, name, fn])

	useEffect(() => {
		checkFeature()
	}, [checkFeature])

	return <>{children}</>
}
