export const siteUrl = (url: string) => {
	const base =
		typeof process === 'undefined'
			? 'https://www.highlight.io'
			: process.env.WEBSITE_URL || 'https://www.highlight.io'
	return `${base}${url}`
}
