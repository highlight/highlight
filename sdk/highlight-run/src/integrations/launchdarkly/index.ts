import type { LDMultiKindContext } from './types/LDMultiKindContext'
import type { LDContext } from './types/LDContext'
import type { LDContextCommon } from './types/LDContextCommon'
import {
	Hook,
	IdentifySeriesContext,
	IdentifySeriesData,
	IdentifySeriesResult,
} from '../../types/Hooks'
import { trace } from '@opentelemetry/api'
import type { HighlightPublicInterface } from '../../types/types'
import type { ErrorMessage, Source } from '../../types/shared-types'
import { IntegrationClient } from '../index'

const FEATURE_FLAG_SCOPE = 'feature_flag'
const FEATURE_FLAG_KEY_ATTR = `${FEATURE_FLAG_SCOPE}.key`
const FEATURE_FLAG_PROVIDER_ATTR = `${FEATURE_FLAG_SCOPE}.provider_name`
const FEATURE_FLAG_CONTEXT_KEY_ATTR = `${FEATURE_FLAG_SCOPE}.context.key`
const FEATURE_FLAG_VARIANT_ATTR = `${FEATURE_FLAG_SCOPE}.variant`
const FEATURE_FLAG_SPAN_NAME = 'evaluation'

const LD_ERROR_EVENT = '$ld:telemetry:error'
const LD_TRACK_EVENT = '$ld:telemetry:track'

function encodeKey(key: string): string {
	if (key.includes('%') || key.includes(':')) {
		return key.replace(/%/g, '%25').replace(/:/g, '%3A')
	}
	return key
}

function isMultiContext(context: any): context is LDMultiKindContext {
	return context.kind === 'multi'
}

function getCanonicalKey(context: LDContext) {
	if (isMultiContext(context)) {
		return Object.keys(context)
			.sort()
			.filter((key) => key !== 'kind')
			.map((key) => {
				return `${key}:${encodeKey((context[key] as LDContextCommon).key)}`
			})
			.join(':')
	}

	return context.key
}

export interface LDClientMin {
	track(key: string, data?: any, metricValue?: number): void

	identify(ctx: any): void

	addHook(hook: Hook): void
}

export function setupLaunchDarklyIntegration(
	hClient: HighlightPublicInterface,
	ldClient: LDClientMin,
) {
	ldClient.addHook({
		getMetadata: () => {
			return {
				name: 'HighlightHook',
			}
		},
		afterIdentify: (
			hookContext: IdentifySeriesContext,
			data: IdentifySeriesData,
			result: IdentifySeriesResult,
		) => {
			hClient.identify(
				getCanonicalKey(hookContext.context),
				undefined,
				'LaunchDarkly',
			)
			return data
		},
		afterEvaluation: (hookContext, data, detail) => {
			const eventAttributes: {
				[index: string]: number | boolean | string
			} = {
				[FEATURE_FLAG_KEY_ATTR]: hookContext.flagKey,
				[FEATURE_FLAG_PROVIDER_ATTR]: 'LaunchDarkly',
				[FEATURE_FLAG_VARIANT_ATTR]: JSON.stringify(detail.value),
			}

			if (hookContext.context) {
				eventAttributes[FEATURE_FLAG_CONTEXT_KEY_ATTR] =
					getCanonicalKey(hookContext.context)
			}

			let span = trace.getActiveSpan()
			if (span) {
				span.addEvent(FEATURE_FLAG_SCOPE, eventAttributes)
			} else {
				hClient.startSpan(FEATURE_FLAG_SPAN_NAME, (s) => {
					if (s) {
						s.addEvent(FEATURE_FLAG_SCOPE, eventAttributes)
					}
				})
			}

			hClient.track(FEATURE_FLAG_SPAN_NAME, eventAttributes)

			return data
		},
	})
}

export class LaunchDarklyIntegration implements IntegrationClient {
	client: LDClientMin
	constructor(client: LDClientMin) {
		this.client = client
	}

	identify(
		sessionSecureID: string,
		user_identifier: string,
		user_object = {},
		source?: Source,
	) {
		// noop - no highlight forwarding of identify call
	}

	error(sessionSecureID: string, error: ErrorMessage) {
		this.client.track(LD_ERROR_EVENT, {
			...error,
			sessionSecureID,
		})
	}

	track(sessionSecureID: string, metadata: object) {
		this.client.track(LD_TRACK_EVENT, {
			...metadata,
			sessionSecureID,
		})
	}
}
