import { toast } from '@components/Toaster'
import analytics from '@util/analytics'

import { FRONTEND_URI } from '@/constants'

export function GetBaseURL(): string {
	return FRONTEND_URI
}

export const showSupportMessage = async (msg = '') => {
	analytics.track('showSupportMessage', { msg })
	await toast.info(
		msg.length
			? `Please send the following on our discord: ${msg}`
			: `Please reach out for help on our Discord!`,
		{ duration: 5000 },
	)
}
