import Cookies from 'js-cookie'
import moment from 'moment'

export const PASSWORD_AUTH_TOKEN = 'highlight-password-auth-token'

// Storing in a cookie so we can set an expiration.
export const passwordAuthTokenManager = {
	set: (tokan: string) => {
		Cookies.set(PASSWORD_AUTH_TOKEN, tokan, {
			expires: moment().add(1, 'day').toDate(),
		})
	},
	get: () => {
		return Cookies.get(PASSWORD_AUTH_TOKEN)
	},
	clear: () => {
		Cookies.remove(PASSWORD_AUTH_TOKEN)
	},
}
