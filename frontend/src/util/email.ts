export const getEmailDomain = (email?: string) => {
	if (!email) {
		return ''
	}
	if (!email.includes('@')) {
		return ''
	}

	const [, domain] = email.split('@')
	return domain
}
