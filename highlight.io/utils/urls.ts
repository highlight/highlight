export const siteUrl = (url: string) => {
  const base = process.env.WEBSITE_URL || 'https://highlight.io'
  return `${base}${url}`
}
