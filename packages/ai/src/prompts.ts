export const getSessionHighlightPrompt = (events: string) =>
	`Given an array of events performed by a user from a session recording for a web application, make inferences and justifications and summarize interesting things about the session in 3 insights. 

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

const EXAMPLE1 = `Input: 
[{"data":{"payload":".abcd","tag":"Focus"},"timestamp":1685578851972},{"data":{"payload":".abcd","tag":"Focus"},"timestamp":1685579269902},{"data":{"payload":".abcd","tag":"Focus"},"timestamp":1685579351368},{"data":{"payload":".abcd","tag":"Focus"},"timestamp":1685579353770},{"data":{"payload":true,"tag":"TabHidden"},"timestamp":1685579355604},{"data":{"payload":false,"tag":"TabHidden"},"timestamp":1685579356604},{"data":{"payload":".abcd","tag":"Focus"},"timestamp":1685579356605},{"data":{"payload":".abcd","tag":"Focus"},"timestamp":1685579509642},{"data":{"payload":true,"tag":"TabHidden"},"timestamp":1685579510438},{"data":{"payload":false,"tag":"TabHidden"},"timestamp":1685579621533},{"data":{"payload":"https://app.com/a/b","tag":"Reload"},"timestamp":1685579782990},{"data":{"payload":"https://app.com/a/b","tag":"Reload"},"timestamp":1685579782995},{"data":{"payload":"https://app.com/a/b","tag":"Reload"},"timestamp":1685579782999},{"data":{"payload":true,"tag":"TabHidden"},"timestamp":1685580283694},{"data":{"payload":false,"tag":"TabHidden"},"timestamp":1685584462862},{"data":{"payload":true,"tag":"TabHidden"},"timestamp":1685584487240},{"data":{"payload":false,"tag":"TabHidden"},"timestamp":1685584955918},{"data":{"payload":"{"event":"Authenticated"}","tag":"Track"},"timestamp":1685584997030}]
Output: 
1. The user switched between tabs frequently, indicating the possibility of multitasking or having distractions. 
2. The user reloaded the page https://app.com/a/b multiple times, which could mean that there were issues with the page
3. The user focused on the element .abcd many times, this feature is heavily used by the user. 
`

const EXAMPLE2 = `Input: 
[{"data":{"payload":".abcd","tag":"Click"},"timestamp":1685579269902},{"data":{"payload":".abcd","tag":"Click"},"timestamp":1685579269906},{"data":{"payload":".abcd","tag":"Click"},"timestamp":1685579269909},{"data":{"payload":true,"tag":"TabHidden"},"timestamp":1685579355604},{"data":{"payload":false,"tag":"TabHidden"},"timestamp":1685579356604},{"data":{"payload":".abcd","tag":"Focus"},"timestamp":1685579356605},{"data":{"payload":".abcd","tag":"Focus"},"timestamp":1685579509642},{"data":{"payload":true,"tag":"TabHidden"},"timestamp":1685579510438},{"data":{"payload":false,"tag":"TabHidden"},"timestamp":1685579621533},{"data":{"payload":"https://app.com/a/b","tag":"Reload"},"timestamp":1685579782999},{"data":{"payload":true,"tag":"TabHidden"},"timestamp":1685580283694},{"data":{"payload":false,"tag":"TabHidden"},"timestamp":1685584462862},{"data":{"payload":true,"tag":"TabHidden"},"timestamp":1685584487240},{"data":{"payload":false,"tag":"TabHidden"},"timestamp":1685584955918},{"data":{"payload":"{"project_id":"1","is_guest":false,"is_session_processed":true,"secure_id":"abcdef","event":"Viewed session"}","tag":"Track"},"timestamp":1685584997033}]
Output: 
1. The user switched between tabs frequently, indicating the possibility of multitasking or having distractions. 
2. The user viewed the session with secureId "abcdef" for a long time, indicating a point of interest
3. The user clicked on the element .abcd multiple times in a short time, this could mean frustration with the feature not working as expected. 
`

const FORMAT_INSTRUCTION = `Format: 
1. <Insight>
2. <Insight>
3. <Insight> 
Do not provide any other output other than this format`

const JSON_FORMAT_INSTRUCTION = `
You must respond ONLY with JSON that looks like this: 
[{"insight": "<Insight>", timestamp: number },{"insight": "<Insight>", timestamp: number },{"insight": "<Insight>", timestamp: number }]
Do not provide any other output other than this format.
`
