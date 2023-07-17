export const getSessionHighlightPrompt = (events: string) =>
	`Given array of events performed by a user from a session recording for a web application, make inferences and justifications and summarize interesting things about the session in 3 insights. 

Rules: 
- Use less than 2 sentences for each point
- Provide high level insights, do not mention singular events
- Do not mention event types in the insights
- Insights must be different to each other
- Do not mention identification or authentication events
- Don't mention timestamps in <insight>, insights should be interesting inferences from the input
- Output timestamp that best represents the insight in <timestamp> of output
- Sort the insights by timestamp

${JSON_FORMAT_INSTRUCTION}

Context: 
- The events are JSON objects, where the "timestamp" field represents UNIX time of the event, the "type" field represents the type of event, and the "data" field represents more information about the event
- If the event is of type "Custom", the "tag" field provides the type of custom event, and the "payload" field represents more information about the event
- If the event is of tag "Track", it is a custom event where the actual type of the event is in the "event" field within "data.payload"

${EVENT_TYPES}

Input:
${events}
Output:`
		.slice(0, 32000)
		.replace(/\\/g, '')

const EVENT_TYPES = `
The "type" field follows this format: 
0 - DomContentLoaded
1 - Load
2 -	FullSnapshot, the full page view was loaded
3 -	IncrementalSnapshot, some components were updated
4 -	Meta
5 -	Custom, the "tag" field provides the type of custom event, and the "payload" field represents more information about the event
6 -	Plugin`

const JSON_FORMAT_INSTRUCTION = `
You must respond ONLY with JSON that looks like this: 
[{"insight": "<Insight>", timestamp: number },{"insight": "<Insight>", timestamp: number },{"insight": "<Insight>", timestamp: number }]
Do not provide any other output other than this format.
`
