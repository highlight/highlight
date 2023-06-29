import { Admin } from '@graph/schemas'
import { INTERCOM_APP_ID } from '@util/constants/constants'
import { H } from 'highlight.run'

import { FRONTEND_URI } from '@/constants'

export function GetBaseURL(): string {
	return FRONTEND_URI
}

interface IntercomInit {
	admin?: Admin
}

export function loadIntercom({ admin }: IntercomInit = {}) {
	const config = {
		app_id: INTERCOM_APP_ID,
		alignment: 'right',
		hide_default_launcher: true,
		email: admin?.email,
		user_id: admin?.uid,
	}

	H.getSessionURL()
		.then((sessionUrl) => {
			window.Intercom('boot', {
				...config,
				sessionUrl,
			})
		})
		.catch(() => {
			window.Intercom('boot', config)
		})
}

export const showIntercomBubble = () => {
	window.Intercom('update', { hide_default_launcher: false })
}

export const showIntercomMessage = (message = '') => {
	window.Intercom('showNewMessage', message)
}
