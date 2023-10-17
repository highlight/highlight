import { GetAlertsPagePayloadQuery } from '@/graph/generated/operations'
import {
	DiscordChannelInput,
	SanitizedSlackChannelInput,
} from '@/graph/generated/schemas'
import {
	DEFAULT_FREQUENCY,
	FREQUENCIES,
} from '@/pages/Alerts/AlertConfigurationCard/AlertConfigurationConstants'

export interface EnvironmentSuggestion {
	name: string
	value: string
}

export const dedupeEnvironments = (
	environmentsFromApi: EnvironmentSuggestion[],
) => {
	const allEnvironments = new Set([
		...environmentsFromApi.map(({ value }) => value),
		...DEFAULT_HIGHLIGHT_ENVIRONMENTS,
	])

	return Array.from(allEnvironments)
}

/**
 * Names for the environments a Highlight session was recorded in.
 */
export const DEFAULT_HIGHLIGHT_ENVIRONMENTS = [
	'production',
	'staging',
	'development',
]

/**
 * All form fields for alerts
 */
export interface AlertForm {
	name: string
	belowThreshold: boolean
	threshold: number | undefined
	frequency: number
	threshold_window: number
	excludedEnvironments: string[]
	slackChannels: SanitizedSlackChannelInput[]
	discordChannels: DiscordChannelInput[]
	emails: string[]
	webhookDestinations: string[]
	loaded: boolean
}

/**
 * Gets specific alert given an id
 * @param id
 * @param alertsPayload
 * @returns
 */
export const findAlert = (
	id: string,
	type: 'error' | 'session',
	alertsPayload?: GetAlertsPagePayloadQuery,
) => {
	if (!alertsPayload) {
		return undefined
	}

	if (type === 'error') {
		return alertsPayload.error_alerts.find((alert: any) => alert?.id === id)
	}

	const possibleAlerts = [
		...alertsPayload.new_session_alerts,
		...(alertsPayload.new_user_alerts || []),
		...alertsPayload.track_properties_alerts,
		...alertsPayload.user_properties_alerts,
		...alertsPayload.rage_click_alerts,
	]

	return possibleAlerts.find((alert: any) => alert?.id === id)
}

export const getFrequencyOption = (seconds = DEFAULT_FREQUENCY): any => {
	const option = FREQUENCIES.find(
		(option) => option.value === seconds?.toString(),
	)

	if (!option) {
		return FREQUENCIES.find((option) => option.value === DEFAULT_FREQUENCY)
	}

	return option
}
