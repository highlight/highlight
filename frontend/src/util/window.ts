import analytics from '@util/analytics'
import { message } from 'antd'

import { FRONTEND_URI } from '@/constants'

export function GetBaseURL(): string {
	return FRONTEND_URI
}

export const showSupportBubble = () => {
	analytics.track('showSupportBubble')
}

export const showSupportMessage = async (msg = '') => {
	analytics.track('showSupportMessage', { msg })
	await message.info(
		msg.length
			? `Please send the following on our discord: ${msg}`
			: `Please reach out for help on our Discord!`,
		3,
	)
	showSupportBubble()
}
