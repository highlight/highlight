import { message } from 'antd'

import { FRONTEND_URI } from '@/constants'

export function GetBaseURL(): string {
	return FRONTEND_URI
}

export const showSupportBubble = () => {
	window.open('https://highlight.io/community', '_blank')
}

export const showSupportMessage = async (_ = '') => {
	await message.info(`Please reach out for help on our Discord!`, 3)
	showSupportBubble()
}
