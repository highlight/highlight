import Cookies from 'js-cookie'
import moment from 'moment'

export const REDIRECT_LOCAL_STORAGE_KEY = 'highlight-auth-redirect'

// Storing in a cookie so we can set an expiration.
export const authRedirect = {
	set: (path: string) => {
		Cookies.set(REDIRECT_LOCAL_STORAGE_KEY, path, {
			expires: moment().add(10, 'minutes').toDate(),
		})
	},
	get: () => {
		return Cookies.get(REDIRECT_LOCAL_STORAGE_KEY)
	},
	clear: () => {
		Cookies.remove(REDIRECT_LOCAL_STORAGE_KEY)
	},
}
