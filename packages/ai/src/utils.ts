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
