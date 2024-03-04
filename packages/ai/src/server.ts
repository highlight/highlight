import cors from 'cors'
import express from 'express'
import { Configuration, OpenAIApi } from 'openai'
import { getEvents } from './s3'
import { getInsightsForEvents } from './utils'

const configuration = new Configuration({
	organization: 'org-q9w5AyJeJV2vbW0t1g74sCB0',
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || '8765'

app.post('/session/insight', async (req, res) => {
	const { id, project_id } = req.body
	const events = JSON.parse(await getEvents(project_id, id))
	const responseString = await getInsightsForEvents(openai, events)
	return res.json({
		id: id,
		insight: responseString,
	})
})

app.listen(port, () => {
	console.log('Server running on localhost:' + port)
})
