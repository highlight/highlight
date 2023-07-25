import { NetworkResource } from '@/pages/Player/Toolbar/DevToolsWindowV2/utils'

export const getNetworkStatusCode = (resource?: NetworkResource): string => {
	if (!resource) {
		return ''
	}

	// Showing '200' for all requests that aren't 'xmlhttprequest', 'fetch', or 'websocket'
	if (['xmlhttprequest', 'fetch'].includes(resource.initiatorType)) {
		return (
			resource.requestResponsePairs?.response.status?.toString() ||
			'Unknown'
		)
	}

	if (resource.initiatorType === 'websocket') {
		return '101'
	}

	return '200'
}
