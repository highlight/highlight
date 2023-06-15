import { OpenAIApi } from 'openai'
import { getSessionHighlightPrompt } from './prompts'

export enum EventType {
	DomContentLoaded,
	Load,
	FullSnapshot,
	IncrementalSnapshot,
	Meta,
	Custom,
	Plugin,
}

export const parseEventsForInput = (events: any[]) => {
	const parsedEvents: any[] = []
	events.forEach(({ _sid, ...e }, idx) => {
		switch (e.type) {
			case EventType.FullSnapshot:
				parsedEvents.push({ type: e.type, timestamp: e.timestamp })
				return
			case EventType.IncrementalSnapshot:
				const nextEvent = events[Math.min(idx + 1, events.length)]
				if (nextEvent.type !== e.type) {
					parsedEvents.push({ type: e.type, timestamp: e.timestamp })
				}
				return
			default:
				parsedEvents.push(e)
		}
	})
	return parsedEvents
}

export const getInsightsForEvents = async (
	openai: OpenAIApi,
	events: any[],
) => {
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
	return responseString
}
