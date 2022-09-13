export const getMajorVersion = (version: string) => {
	const tokens = version.split('.')
	if (tokens.length === 0) {
		return ''
	}

	return tokens[0]
}

export const getAbsoluteUrl = (url: string) => {
	if (url.startsWith('http')) {
		return url
	}

	return `https://${url}`
}
