import { HighlightEvent } from '@pages/Player/HighlightEvent'
import { eventWithTime } from '@rrweb/types'
import { EventType } from 'rrweb'

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
	eventTypeFilters: Set<string>,
) => {
	const normalizedSearchQuery = searchQuery.toLocaleLowerCase()
	const searchTokens = normalizedSearchQuery.split(' ')

	return events.filter((event) => {
		if (
			event.type === EventType.Custom &&
			eventTypeFilters.has(event.data.tag)
		) {
			switch (event.data.tag) {
				case 'Identify':
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
				case 'Segment':
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
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Navigate':
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Referrer':
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Click':
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Reload':
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Performance':
					return false
				default:
					return true
			}
		}
	})
}
