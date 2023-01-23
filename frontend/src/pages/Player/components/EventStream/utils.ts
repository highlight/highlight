import { EventType } from '@highlight-run/rrweb'
import { eventWithTime } from '@highlight-run/rrweb-types'
import { HighlightEvent } from '@pages/Player/HighlightEvent'

// used in filter() type methods to fetch events we want
export const usefulEvent = (e: eventWithTime): boolean => {
	if (e.type === EventType.Custom) {
		if (e.data.tag === 'Segment Identify') {
			e.data.tag = 'Segment'
		}
		return !!e.data.tag
	}

	return false
}

export const getFilteredEvents = (
	searchQuery: string,
	events: HighlightEvent[],
	eventTypeFilters: any,
) => {
	const normalizedSearchQuery = searchQuery.toLocaleLowerCase()
	const searchTokens = normalizedSearchQuery.split(' ')

	return events.filter((event) => {
		if (event.type === EventType.Custom) {
			switch (event.data.tag) {
				case 'Identify':
					if (!eventTypeFilters.showIdentify) {
						return false
					}
					try {
						const userObject = JSON.parse(
							event.data.payload as string,
						)
						const keys = Object.keys(userObject)

						/**
						 * For user properties, we allow for searching by the key.
						 */
						const matchedKey = searchTokens.some((searchToken) => {
							return keys.some((key) =>
								key.toLocaleLowerCase().includes(searchToken),
							)
						})

						return (
							matchedKey ||
							keys.some((key) => {
								if (typeof userObject[key] === 'string') {
									return searchTokens.some((searchToken) => {
										return userObject[key]
											.toLowerCase()
											.includes(searchToken)
									})
								}
								return false
							})
						)
					} catch (e) {
						return false
					}
				case 'Track':
					if (!eventTypeFilters.showTrack) {
						return false
					}
					try {
						const trackProperties = JSON.parse(
							event.data.payload as string,
						)
						const keys = Object.keys(trackProperties)

						/**
						 * For track properties, we allow for searching by the key.
						 */
						const matchedKey = searchTokens.some((searchToken) => {
							return keys.some((key) =>
								key.toLocaleLowerCase().includes(searchToken),
							)
						})

						return (
							matchedKey ||
							keys.some((key) => {
								if (typeof trackProperties[key] === 'string') {
									return searchTokens.some((searchToken) => {
										return trackProperties[key]
											.toLowerCase()
											.includes(searchToken)
									})
								}
								return false
							})
						)
					} catch (e) {
						return false
					}
				case 'Viewport':
					if (!eventTypeFilters.showViewport) {
						return false
					}
					return 'viewport'.includes(normalizedSearchQuery)
				case 'WebVital':
					if (!eventTypeFilters.showWebVitals) {
						return false
					}
					return 'web vitals'.includes(normalizedSearchQuery)
				case 'Segment':
					if (!eventTypeFilters.showSegment) {
						return false
					}
					try {
						const userObject = JSON.parse(
							event.data.payload as string,
						)
						const keys = Object.keys(userObject)

						return keys.some((key) => {
							if (typeof userObject[key] === 'string') {
								return searchTokens.some((searchToken) => {
									return userObject[key]
										.toLowerCase()
										.includes(searchToken)
								})
							}
							return false
						})
					} catch (e) {
						return false
					}
				case 'Focus':
					if (!eventTypeFilters.showFocus) {
						return false
					}
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Navigate':
					if (!eventTypeFilters.showNavigate) {
						return false
					}
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Referrer':
					if (!eventTypeFilters.showReferrer) {
						return false
					}
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Click':
					if (!eventTypeFilters.showClick) {
						return false
					}
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Reload':
					if (!eventTypeFilters.showReload) {
						return false
					}
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Web Vitals':
					return eventTypeFilters.showWebVitals
				case 'Performance':
					return false
				default:
					return event.data.tag
						.toLocaleLowerCase()
						.includes(normalizedSearchQuery)
			}
		}
	})
}
