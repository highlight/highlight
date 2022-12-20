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
	hideMessage?: boolean
}

export function showIntercom({ admin, hideMessage }: IntercomInit = {}) {
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

	if (!hideMessage) {
		window.Intercom('showNewMessage')
	}
}
