import { Session } from '@graph/schemas'
import { NetworkResourceWithID } from '@pages/Player/ResourcesContext/ResourcesContext'

export enum SessionPageSearchParams {
	/** Automatically sets the date range for the current segment based on the value. */
	date = 'date',
}

/**
 * Handles rendering the modal within the bounds of the window.
 * @param clickX The X position of where the pointer clicked to create the comment.
 * @param modalWidth The width of the modal.
 */
export const getNewCommentFormCoordinates = (
	modalWidth: number,
	clickX?: number,
	clickY?: number,
) => {
	if (clickX === undefined || clickY === undefined) {
		return { left: `${clickX}px`, top: `${clickY}px` }
	}

	const END_PADDING = 32
	const modalEndXPosition = clickX + modalWidth + END_PADDING
	let newX = clickX

	// If the ending edge of the modal is rendered offscreen then mirror the modal so it renders to the left of the clicked position.
	// This is prevent the modal from being rendered offscreen.
	if (modalEndXPosition > window.innerWidth) {
		newX = clickX - modalWidth - 1.5 * END_PADDING
	}

	return {
		left: `${newX}px`,
		top: `${clickY}px`,
	}
}

export const REQUEST_INITIATOR_TYPES = ['xmlhttprequest', 'fetch'] as const

export const getGraphQLResolverName = (
	resource: NetworkResourceWithID,
): null | string => {
	if (
		!REQUEST_INITIATOR_TYPES.includes(
			resource.initiatorType as typeof REQUEST_INITIATOR_TYPES[number],
		)
	) {
		return null
	}
	if (!resource.requestResponsePairs) {
		return null
	}

	try {
		const body = JSON.parse(resource.requestResponsePairs.request.body)

		if ('operationName' in body) {
			return body['operationName']
		}
	} catch {
		return null
	}

	return null
}

export const sessionIsBackfilled = (session?: Session) => {
	// Temporary workaround until we backfill old identified sessions. The
	// default value of `sessions.identified` is `false`, so the check below
	// will return true for records that have not been updated. `client_id` was
	// rolled out at the same time as `identified`.
	if (!session?.client_id) {
		return false
	}

	return Boolean(session?.identifier) && session?.identified === false
}

export const getTimelineEventDisplayName = (name: string) => {
	switch (name) {
		case 'TabHidden':
			return 'Tab State'
		default:
			return name
	}
}

export const getTimelineEventTooltipText = (name: string) => {
	switch (name) {
		case 'Click':
			return 'A click was recorded in your application.'
		case 'Reload':
			return 'The application was reloaded.'
		case 'Navigate':
			return 'A navigation event occurred in the application.'
		case 'Track':
			return 'The session emitted a tracked property.'
		case 'Comments':
			return 'A comment was added to the session.'
		case 'Viewport':
			return 'The viewport of the application changed.'
		case 'Identify':
			return 'The user was identified.'
		case 'Web Vitals':
			return 'The application recorded web vitals performance metrics.'
		case 'Referrer':
			return 'The application was loaded with a referrer header.'
		case 'Errors':
			return 'An error occurred in your application.'
		case 'TabHidden':
			return 'The application was hidden.'
		case 'TabShown':
			return 'The application became visible.'
		default:
			return name
	}
}
