import type { APIGatewayEvent } from 'aws-lambda'
import { ClientOptions, OpenAI } from 'openai'
import { getEvents } from './s3'
import { getInsightsForEvents } from './utils'

const configuration = {
	organization: 'org-q9w5AyJeJV2vbW0t1g74sCB0',
	apiKey: process.env.OPENAI_API_KEY,
} as ClientOptions
const openai = new OpenAI(configuration)

export const handler = async (event?: APIGatewayEvent) => {
	const args = JSON.parse(event?.body ?? '[]')
	const { id, project_id } = args
	const events = JSON.parse(await getEvents(project_id, id))
	const responseString = await getInsightsForEvents(openai, events)
	return {
		statusCode: 200,
		body: JSON.stringify({ id: id, insight: responseString }),
		headers: {
			'content-type': 'application/json',
		},
	}
}
