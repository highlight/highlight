import type { LDMultiKindContext } from './types/LDMultiKindContext'
import type { LDContext } from './types/LDContext'
import type { LDContextCommon } from './types/LDContextCommon'
import {
	IdentifySeriesContext,
	IdentifySeriesData,
	IdentifySeriesResult,
} from './types/Hooks'
import { trace } from '@opentelemetry/api'
import { type HighlightPublicInterface, MetricCategory } from '../../client'
import type { ErrorMessage, Source } from '../../client/types/shared-types'
import type { IntegrationClient } from '../index'
import type { LDClientMin } from './types/LDClient'
import type { RecordMetric } from '../../client/types/types'

const FEATURE_FLAG_SCOPE = 'feature_flag'
// TODO(vkorolik) reporting environment as `${FEATURE_FLAG_SCOPE}.set.id`
const FEATURE_FLAG_KEY_ATTR = `${FEATURE_FLAG_SCOPE}.key`
const FEATURE_FLAG_PROVIDER_ATTR = `${FEATURE_FLAG_SCOPE}.provider.name`
const FEATURE_FLAG_CONTEXT_KEY_ATTR = `${FEATURE_FLAG_SCOPE}.context.key`
const FEATURE_FLAG_VARIANT_ATTR = `${FEATURE_FLAG_SCOPE}.result.variant`
const FEATURE_FLAG_SPAN_NAME = 'evaluation'

const LD_INITIALIZE_EVENT = '$ld:telemetry:initialize'
const LD_ERROR_EVENT = '$ld:telemetry:error'
const LD_TRACK_EVENT = '$ld:telemetry:track'
const LD_METRIC_EVENT = '$ld:telemetry:metric'

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
			_result: IdentifySeriesResult,
		) => {
			hClient.identify(
				getCanonicalKey(hookContext.context),
				hookContext.context,
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

	init(sessionSecureID: string) {
		this.client.track(LD_INITIALIZE_EVENT, {
			sessionSecureID,
		})
	}

	recordMetric(sessionSecureID: string, metric: RecordMetric) {
		// only record web vitals
		if (metric.category !== MetricCategory.WebVital) {
			return
		}
		// ignore Jank metric, sent on interaction
		if (metric.name === 'Jank') {
			return
		}
		this.client.track(
			`${LD_METRIC_EVENT}:${metric.name.toLowerCase()}`,
			{
				...metric,
				sessionSecureID,
			},
			metric.value,
		)
	}

	identify(
		_sessionSecureID: string,
		_user_identifier: string,
		_user_object = {},
		_source?: Source,
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
		const event = (metadata as unknown as { event?: string }).event
		// skip integration hClient.track() calls
		if (event === FEATURE_FLAG_SPAN_NAME) {
			return
		}
		this.client.track(
			event ? `${LD_TRACK_EVENT}:${event}` : LD_TRACK_EVENT,
			{
				...metadata,
				sessionSecureID,
			},
		)
	}
}
