export const IFRAME_PARENT_READY = 'iframe parent ready'

export interface HighlightIframeMessage {
	highlight: typeof IFRAME_PARENT_READY
	projectID: number
	sessionSecureID: string
}

export const IFRAME_PARENT_RESPONSE = 'iframe ok'

export interface HighlightIframeReponse {
	highlight: typeof IFRAME_PARENT_RESPONSE
}
