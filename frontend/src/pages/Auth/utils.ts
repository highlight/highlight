import Cookies from 'js-cookie'
import moment from 'moment'

export const REDIRECT_LOCAL_STORAGE_KEY = 'highlight-auth-redirect'

export const authRedirect = {
	set: (path: string) => {
		Cookies.set(REDIRECT_LOCAL_STORAGE_KEY, path, {
			expires: moment().add(15, 'minutes').toDate(),
		})
	},
	get: () => {
		return Cookies.get(REDIRECT_LOCAL_STORAGE_KEY)
	},
	clear: () => {
		Cookies.remove(REDIRECT_LOCAL_STORAGE_KEY)
	},
}
