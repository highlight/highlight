import { LDMultiKindContext } from '@highlight-run/client/src/types/LDMultiKindContext'
import { LDContext } from '@highlight-run/client/src/types/LDContext'
import { LDContextCommon } from '@highlight-run/client/src/types/LDContextCommon'
import {
	IdentifySeriesContext,
	IdentifySeriesData,
	IdentifySeriesResult,
} from '@highlight-run/client/src/types/Hooks'
import { trace } from '@opentelemetry/api'
import {
	HighlightPublicInterface,
	LDClientMin,
} from '@highlight-run/client/src/types/types'

const FEATURE_FLAG_SCOPE = 'feature_flag'
const FEATURE_FLAG_KEY_ATTR = `${FEATURE_FLAG_SCOPE}.key`
const FEATURE_FLAG_PROVIDER_ATTR = `${FEATURE_FLAG_SCOPE}.provider_name`
const FEATURE_FLAG_CONTEXT_KEY_ATTR = `${FEATURE_FLAG_SCOPE}.context.key`
const FEATURE_FLAG_VARIANT_ATTR = `${FEATURE_FLAG_SCOPE}.variant`

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
			result: IdentifySeriesResult,
		) => {
			hClient.identify(getCanonicalKey(hookContext.context))
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
				hClient.startSpan('evaluation', (s) => {
					if (s) {
						s.addEvent(FEATURE_FLAG_SCOPE, eventAttributes)
					}
				})
			}

			hClient.track('evaluation', eventAttributes)

			return data
		},
	})
}
