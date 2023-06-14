import { Configuration, OpenAIApi } from 'openai'
import { getSessionHighlightPrompt } from './prompts'
import { getEvents } from './s3'
import { parseEventsForInput } from './utils'
import { APIGatewayEvent } from 'aws-lambda'

const configuration = new Configuration({
	organization: 'org-q9w5AyJeJV2vbW0t1g74sCB0',
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const handler = async (event?: APIGatewayEvent) => {
	const args = JSON.parse(event?.body ?? '[]')
	const { id, project_id } = args
	const events = JSON.parse(await getEvents(project_id, id))
	const parsedEvents = parseEventsForInput(events)
	const completion = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: 'user',
				content: getSessionHighlightPrompt(
					JSON.stringify(parsedEvents),
				),
			},
		],
		temperature: 1.2,
	})
	const responseString = completion.data.choices[0].message?.content || ''
	return {
		statusCode: 200,
		body: JSON.stringify({ id: id, insight: responseString }),
		headers: {
			'content-type': 'application/json',
		},
	}
}
