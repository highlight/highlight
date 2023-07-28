import { render } from '@react-email/render'
import { APIGatewayEvent } from 'aws-lambda'
import {
	SessionInsightsEmail,
	SessionInsightsEmailProps,
} from '../emails/session-insights'

export const handler = async (event?: APIGatewayEvent) => {
	const args = JSON.parse(event?.body ?? '{}') as SessionInsightsEmailProps
	const html = render(SessionInsightsEmail(args))
	return {
		statusCode: 200,
		body: html,
		headers: {
			'content-type': 'text/html',
		},
	}
}
