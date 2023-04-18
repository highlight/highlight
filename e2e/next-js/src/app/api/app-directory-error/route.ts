import http from 'http'
// import { withHighlight } from '@/app/utils/highlight.config'

export const GET = async function GET(req: http.IncomingMessage) {
	console.info('Here: /api/app-directory-error')

	throw new Error('This is an error')

	return new Response('Success: /api/app-directory-error')
}
