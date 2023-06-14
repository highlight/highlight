import express from 'express'
import { Configuration, OpenAIApi } from 'openai'
import cors from 'cors'
import { getSessionHighlightPrompt } from './prompts'
import { getEvents } from './s3'
import { parseEventsForInput } from './utils'

// const configuration = new Configuration({
// 	organization: 'org-q9w5AyJeJV2vbW0t1g74sCB0',
// 	apiKey: process.env.OPENAI_API_KEY,
// })
// const openai = new OpenAIApi(configuration)

const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || '8765'

app.post('/session/insight', async (req, res) => {
	const { id, project_id } = req.body
	const events = JSON.parse(await getEvents(project_id, id))
	// const events = JSON.parse(await getEvents(1, 232563428))
	const parsedEvents = parseEventsForInput(events)
	// const completion = await openai.createChatCompletion({
	// 	model: 'gpt-3.5-turbo',
	// 	messages: [
	// 		{
	// 			role: 'user',
	// 			content: getSessionHighlightPrompt(
	// 				JSON.stringify(parsedEvents),
	// 			),
	// 		},
	// 	],
	// 	temperature: 1.2,
	// })
	// const responseString = completion.data.choices[0].message?.content || ''
	return res.json({ id: id, insight: JSON.stringify(parsedEvents) })
	// return res.json({ id: id, insight: responseString })
})

app.listen(port, () => {
	console.log('Server running on localhost:' + port)
})
