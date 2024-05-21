import analytics from '@util/analytics'
import { toast } from 'sonner'

import { FRONTEND_URI } from '@/constants'

export function GetBaseURL(): string {
	return FRONTEND_URI
}

export const showSupportBubble = () => {
	analytics.track('showSupportBubble')
}

export const showSupportMessage = async (msg = '') => {
	analytics.track('showSupportMessage', { msg })
	// TODO(spenny): await
	toast.info(
		msg.length
			? `Please send the following on our discord: ${msg}`
			: `Please reach out for help on our Discord!`,
		{ duration: 3000 },
	)
	showSupportBubble()
}
