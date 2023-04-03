export const siteUrl = (url: string) => {
	const base =
		typeof process === 'undefined'
			? 'https://highlight.io'
			: process.env.WEBSITE_URL || 'https://highlight.io'
	return `${base}${url}`
}
