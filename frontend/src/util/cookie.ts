export enum Cookies {
	OAuthClientID = 'highlight_oauth_client_id',
}

export function upsertCookie(name: string, value: string, minutes: number) {
	let expires = ''
	if (minutes) {
		const date = new Date()
		date.setTime(date.getTime() + minutes * 60 * 1000)
		expires = '; expires=' + date.toUTCString()
	}
	document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`
}

export function getCookie(name: string) {
	const nameEQ = encodeURIComponent(name) + '='
	const cookies = document.cookie.split('; ')
	for (const cookie of cookies) {
		if (cookie.startsWith(nameEQ)) {
			return decodeURIComponent(cookie.substring(nameEQ.length))
		}
	}
	return null
}
