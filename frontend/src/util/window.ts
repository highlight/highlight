import { Admin } from '@graph/schemas'
import { INTERCOM_APP_ID } from '@util/constants/constants'
import { H } from 'highlight.run'

export function GetBaseURL(): string {
	return (
		import.meta.env.REACT_APP_FRONTEND_URI ||
		window.location.protocol + '//' + window.location.host
	)
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
	window.Intercom('boot', { hide_default_launcher: false })
}

export const showIntercomNewMessage = (message = '') => {
	window.Intercom('showNewMessage', message)
}
