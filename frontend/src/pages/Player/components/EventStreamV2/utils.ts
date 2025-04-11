import { HighlightEvent } from '@pages/Player/HighlightEvent'
import { eventWithTime } from '@rrweb/types'
import { EventType } from 'rrweb'
import type { ViewportResizeListenerArgs } from 'highlight.run'

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
			if (!searchQuery) {
				return true
			}
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
						const matchedKey = searchTokens.every((searchToken) => {
							return keys.some((key) =>
								key.toLocaleLowerCase().includes(searchToken),
							)
						})

						return (
							matchedKey ||
							keys.some((key) => {
								if (typeof userObject[key] === 'string') {
									return searchTokens.every((searchToken) => {
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
						const matchedKey = searchTokens.every((searchToken) => {
							return keys.some((key) =>
								key.toLocaleLowerCase().includes(searchToken),
							)
						})

						return (
							matchedKey ||
							keys.some((key) => {
								if (typeof trackProperties[key] === 'string') {
									return searchTokens.every((searchToken) => {
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
								return searchTokens.every((searchToken) => {
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
				case 'Viewport':
					const viewportPayload = event.data
						.payload as ViewportResizeListenerArgs
					const keys = Object.keys(
						viewportPayload,
					) as (keyof ViewportResizeListenerArgs)[]
					return keys.some((key) => {
						return searchTokens.every((searchToken) => {
							return (
								key.toLowerCase().includes(searchToken) ||
								viewportPayload[key]
									.toString()
									.includes(searchToken)
							)
						})
					})
				case 'Web Vitals':
					const { vitals } = event.data.payload as {
						vitals: {
							name: string[] | string
							value: number | null
						}[]
					}

					return vitals.some(({ name, value }) => {
						if (value === null) {
							console.log(`null value for ${name}`)
						}
						const n = Array.isArray(name) ? name.join('') : name
						return searchTokens.every((searchToken) => {
							return (
								n.toLowerCase().includes(searchToken) ||
								value?.toString().includes(searchToken)
							)
						})
					})
				case 'Click':
					const clickPayload = event.data.payload as {
						clickTextContent?: string
						clickTarget?: string
						clickSelector?: string
					}
					return searchTokens.every((searchToken) => {
						return [
							clickPayload.clickTextContent,
							clickPayload.clickTarget,
							clickPayload.clickSelector,
						].some((clickValue) => {
							return clickValue
								? clickValue.toLowerCase().includes(searchToken)
								: false
						})
					})
				case 'RageClicks':
					return false
				case 'TabHidden':
					return false
				default:
					return searchTokens.every((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
			}
		}
	})
}
