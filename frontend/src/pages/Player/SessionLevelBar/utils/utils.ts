import { customEvent } from '@rrweb/types'

import {
	HighlightEvent,
	HighlightJankPayload,
	HighlightPerformancePayload,
} from '../../HighlightEvent'

/**
 * Finds the first event of a type.
 * Assumes the events are sorted by timestamp.
 * @param events Replayer Events
 * @param type A list of events to find the first of. Will return the first match in the list.
 */
export const findFirstEventOfType = (
	events: HighlightEvent[],
	type: string[],
) => {
	return events.find((e) => {
		const event = e as customEvent<string>
		if (type.includes(event.data.tag)) {
			return event.data.payload
		}
	})
}

export const findLatestUrl = (
	urlEvents: customEvent<string>[],
	currentTime: number,
) => {
	if (urlEvents.length === 0) {
		return '-'
	}
	let latestUrl = urlEvents[0].data.payload
	let i = 0

	while (i < urlEvents.length) {
		const urlEvent = urlEvents[i]
		// timestamp always exists
		// @ts-expect-error
		if (urlEvent.timestamp > currentTime) {
			break
		}
		latestUrl = urlEvent.data.payload
		i++
	}

	return latestUrl
}

export const getAllUrlEvents = (events: HighlightEvent[]) => {
	const urlEvents = events.filter((event) => {
		if (event.type !== 5) {
			return false
		}

		if (event.data.tag === 'Navigate' || event.data.tag === 'Reload') {
			return true
		}
	})

	return urlEvents as customEvent<string>[]
}

export const getBrowserExtensionScriptURLs = (events: HighlightEvent[]) => {
	const scriptURLs: Set<string> = new Set()
	const elementEvents = events.filter((event) => event.type === 2)

	const isChromeExtensionScript = (src?: string) =>
		src && src.startsWith('chrome-extension://')

	elementEvents.forEach((event) => {
		const node = event.data.node as any
		node.childNodes?.forEach((childNode: any) => {
			childNode.childNodes?.forEach((grandChildNode: any) => {
				if (
					grandChildNode?.attributes?.src &&
					isChromeExtensionScript(grandChildNode.attributes.src)
				) {
					scriptURLs.add(grandChildNode.attributes.src)
				}
				grandChildNode?.childNodes?.forEach((element: any) => {
					if (element.tagName === 'script') {
						if (
							element.attributes.src &&
							isChromeExtensionScript(element.attributes.src)
						) {
							scriptURLs.add(element.attributes.src)
						}
					}
				})
			})
		})
	})

	return [...scriptURLs]
}

const getChromeExtensionID = (extensionURL: string) => {
	const regex = /chrome-extension:\/\/\w*/gm
	const tokens = regex.exec(extensionURL)

	if (tokens && tokens.length > 0) {
		const path = tokens[0]
		const [, id] = path.split('chrome-extension://')

		if (id) {
			return id
		}
	}

	return null
}

export const getChromeExtensionURL = (extensionURL: string) => {
	const id = getChromeExtensionID(extensionURL)
	const GOOGLE_SEARCH_URL = `https://www.google.com/search?q=${extensionURL}`
	const CHROME_STORE_URL = `https://chrome.google.com/webstore/detail/${id}`

	return CHROME_STORE_URL || GOOGLE_SEARCH_URL
}

export const getAllPerformanceEvents = (
	events: HighlightEvent[],
): HighlightPerformancePayload[] => {
	const performanceEvents = events.filter((event) => {
		if (event.type !== 5) {
			return false
		}

		if (event.data.tag === 'Performance') {
			return true
		}
	})

	return performanceEvents.map((event) =>
		JSON.parse((event.data as any).payload),
	)
}

export const getAllJankEvents = (
	events: HighlightEvent[],
): HighlightJankPayload[] => {
	return events
		.filter((event) => {
			if (event.type !== 5) {
				return false
			}
			return event.data.tag === 'Jank'
		})
		.map(
			(event) =>
				JSON.parse((event.data as any).payload) as HighlightJankPayload,
		)
}
