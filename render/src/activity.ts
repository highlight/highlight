import { APIGatewayEvent } from 'aws-lambda'

export const handler = (event?: APIGatewayEvent) => {
	const body = event?.body
	if (!body) {
		return media(event)
	}
	return screenshot(event)
}
