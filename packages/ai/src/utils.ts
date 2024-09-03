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
		if (e != null) {
			switch (e.type) {
				case EventType.FullSnapshot:
					parsedEvents.push({ type: e.type, timestamp: e.timestamp })
					return
				case EventType.IncrementalSnapshot:
					const nextEvent = events[Math.min(idx + 1, events.length)]
					if (nextEvent != null && nextEvent.type !== e.type) {
						parsedEvents.push({
							type: e.type,
							timestamp: e.timestamp,
						})
					}
					return
				case EventType.Custom:
					const stringifiedData = JSON.stringify(e.data).toLowerCase()
					if (
						!stringifiedData.includes('identify') &&
						!stringifiedData.includes('authenticate') &&
						!stringifiedData.includes('performance')
					) {
						parsedEvents.push(e)
					}
					return
				default:
					parsedEvents.push(e)
			}
		}
	})
	return parsedEvents
}

const NUMBER_OF_CHUNKS = 10

/**
 * Splits the session into 10% chunks and returns the 3 most active chunks
 * @param events Array of rrweb events
 * @returns String of events for prompt
 */
export const getMostActiveChunks = (events: any[]) => {
	if (events.length < 2) {
		return ''
	}
	const startTime = events[0].timestamp
	const endTime = events[events.length - 1].timestamp
	const chunkLength = Math.floor((endTime - startTime) / NUMBER_OF_CHUNKS)
	const eventsByChunk: { count: number; events: any[]; chunk: number }[] = []
	for (let i = 0; i < NUMBER_OF_CHUNKS; i++) {
		eventsByChunk.push({ count: 0, events: [], chunk: i })
	}
	events.forEach((e) => {
		const currentChunk = Math.min(
			Math.floor((e.timestamp - startTime) / chunkLength),
			NUMBER_OF_CHUNKS - 1,
		)
		eventsByChunk[currentChunk].count += 1
		eventsByChunk[currentChunk].events.push(e)
	})
	eventsByChunk.sort((a, b) => (a.count > b.count ? -1 : 1))
	const topEvents = eventsByChunk.slice(0, 3)
	topEvents.sort((a, b) => (a.chunk > b.chunk ? 1 : -1))
	return topEvents
		.map((chunk, i) => `Insight ${i + 1}: ${JSON.stringify(chunk.events)}`)
		.join('\n')
}

export const getInsightsForEvents = async (
	openai: OpenAIApi,
	events: any[],
) => {
	const parsedEvents = parseEventsForInput(events)
	const completion = await openai.createChatCompletion({
		model: 'gpt-4o-mini',
		messages: [
			{
				role: 'user',
				content: getSessionHighlightPrompt(
					getMostActiveChunks(parsedEvents),
				),
			},
		],
		temperature: 1.2,
	})
	const responseString = completion.data.choices[0].message?.content || ''
	return responseString
}
