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
export const GraphQLRequest = async (
	doc: string,
	variables?: Variables,
	delay: boolean = true,
) => {
	if (process.env.NODE_ENV !== 'development' && delay) {
		// delay hygraph requests during prerendering to avoid too many concurrent requests
		await new Promise((r) => setTimeout(r, Math.random() * 5000))
	}
	return await graphcms.request(doc, variables)
}
