import CONSTANTS from '@/app/constants'
import { Highlight } from '@highlight-run/next'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export const withHighlight = Highlight({
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
	otlpEndpoint: 'http://localhost:4318',
	backendUrl: 'https://localhost:8082/public',
})
