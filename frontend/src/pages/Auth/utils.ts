export const REDIRECT_LOCAL_STORAGE_KEY = 'highlight-auth-redirect'

export const authRedirect = {
	set: (path: string) => {
		window.localStorage.setItem(REDIRECT_LOCAL_STORAGE_KEY, path)
	},
	get: () => {
		return window.localStorage.getItem(REDIRECT_LOCAL_STORAGE_KEY)
	},
	clear: () => {
		window.localStorage.removeItem(REDIRECT_LOCAL_STORAGE_KEY)
	},
}
