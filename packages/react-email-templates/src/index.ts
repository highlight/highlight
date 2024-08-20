import { render } from '@react-email/render'
import { APIGatewayEvent } from 'aws-lambda'
import {
	AlertUpsertEmail,
	ErrorAlertEmail,
	ErrorsAlertV2Email,
	LogAlertEmail,
	LogsAlertV2Email,
	MetricsAlertV2Email,
	NewSessionAlertEmail,
	NewUserAlertEmail,
	RageClickAlertEmail,
	SessionInsightsEmail,
	SessionsAlertV2Email,
	TracesAlertV2Email,
	TrackEventPropertiesAlertEmail,
	TrackUserPropertiesAlertEmail,
} from '../emails'

export const handler = async (event?: APIGatewayEvent) => {
	const args = JSON.parse(event?.body ?? '{}')

	const EmailTemplate = getEmailTemplate(args.template)
	if (!EmailTemplate) {
		return {
			statusCode: 400,
			body: 'Request is missing a valid "template" property',
		}
	}

	const html = render(EmailTemplate(args.data))
	return {
		statusCode: 200,
		body: html,
		headers: {
			'content-type': 'text/html',
		},
	}
}

const getEmailTemplate = (template: string) => {
	switch (template) {
		case 'error-alert':
			return ErrorAlertEmail
		case 'log-alert':
			return LogAlertEmail
		case 'new-session-alert':
			return NewSessionAlertEmail
		case 'new-user-alert':
			return NewUserAlertEmail
		case 'rage-click-alert':
			return RageClickAlertEmail
		case 'session-insights':
			return SessionInsightsEmail
		case 'track-event-properties-alert':
			return TrackEventPropertiesAlertEmail
		case 'track-user-properties-alert':
			return TrackUserPropertiesAlertEmail
		case 'sessions-alert':
			return SessionsAlertV2Email
		case 'errors-alert':
			return ErrorsAlertV2Email
		case 'logs-alert':
			return LogsAlertV2Email
		case 'traces-alert':
			return TracesAlertV2Email
		case 'metrics-alert':
			return MetricsAlertV2Email
		case 'alert-upsert':
			return AlertUpsertEmail
		default:
			console.error('No email template found for ', template)
	}

	return null
}
