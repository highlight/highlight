import { GraphQLClient, Variables } from 'graphql-request'

const graphcms = new GraphQLClient(
	'https://api-us-west-2.graphcms.com/v2/cl2tzedef0o3p01yz7c7eetq8/master',
	{
		headers: {
			Authorization: `Bearer ${process.env.GRAPHCMS_TOKEN}`,
		},
		fetch,
	},
)
export const GraphQLRequest = async <T extends any>(
	doc: string,
	variables?: Variables,
	delay: boolean = false,
): Promise<T> => {
	if (!process.env.GRAPHCMS_TOKEN) {
		console.warn(
			'GRAPHCMS_TOKEN is missing. hygraph content will not be statically built.',
		)
		return {
			changelogs: [],
			customers: [],
			posts: [],
			tags: [],
		} as T
	}
	if (process.env.NODE_ENV !== 'development' && delay) {
		// delay hygraph requests during prerendering to avoid too many concurrent requests
		await new Promise((r) => setTimeout(r, Math.random() * 5000))
	}
	return await graphcms.request<T>(doc, variables)
}
