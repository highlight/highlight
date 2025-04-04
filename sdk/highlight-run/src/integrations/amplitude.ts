// @ts-nocheck
import type { AmplitudeIntegrationOptions } from './client/types/client'
import type { Integration } from './client/types/types'

interface Window {
	amplitude?: AmplitudeAPI
}

declare var window: Window

export const setupAmplitudeIntegration: Integration = ({
	apiKey,
}: AmplitudeIntegrationOptions) => {
	;(function (e, t) {
		var n = e.amplitude || { _q: [], _iq: {} }
		var r = t.createElement('script')
		r.type = 'text/javascript'
		r.integrity =
			'sha384-+EO59vL/X7v6VE2s6/F4HxfHlK0nDUVWKVg8K9oUlvffAeeaShVBmbORTC2D3UF+'
		r.crossOrigin = 'anonymous'
		r.async = true
		r.src = 'https://cdn.amplitude.com/libs/amplitude-8.17.0-min.gz.js'
		r.onload = function () {
			if (!e.amplitude.runQueuedFunctions) {
				console.log('[Amplitude] Error: could not load SDK')
			}
			amplitude.getInstance().init(apiKey)
		}
		var i = t.getElementsByTagName('script')[0]
		i.parentNode.insertBefore(r, i)
		function s(e, t) {
			e.prototype[t] = function () {
				this._q.push(
					[t].concat(Array.prototype.slice.call(arguments, 0)),
				)
				return this
			}
		}
		var o = function () {
			this._q = []
			return this
		}
		var a = [
			'add',
			'append',
			'clearAll',
			'prepend',
			'set',
			'setOnce',
			'unset',
			'preInsert',
			'postInsert',
			'remove',
		]
		for (var c = 0; c < a.length; c++) {
			s(o, a[c])
		}
		n.Identify = o
		var u = function () {
			this._q = []
			return this
		}
		var l = [
			'setProductId',
			'setQuantity',
			'setPrice',
			'setRevenueType',
			'setEventProperties',
		]
		for (var p = 0; p < l.length; p++) {
			s(u, l[p])
		}
		n.Revenue = u
		var d = [
			'init',
			'logEvent',
			'logRevenue',
			'setUserId',
			'setUserProperties',
			'setOptOut',
			'setVersionName',
			'setDomain',
			'setDeviceId',
			'enableTracking',
			'setGlobalUserProperties',
			'identify',
			'clearUserProperties',
			'setGroup',
			'logRevenueV2',
			'regenerateDeviceId',
			'groupIdentify',
			'onInit',
			'logEventWithTimestamp',
			'logEventWithGroups',
			'setSessionId',
			'resetSessionId',
		]
		function v(e) {
			function t(t) {
				e[t] = function () {
					e._q.push(
						[t].concat(Array.prototype.slice.call(arguments, 0)),
					)
				}
			}
			for (var n = 0; n < d.length; n++) {
				t(d[n])
			}
		}
		v(n)
		n.getInstance = function (e) {
			e = (!e || e.length === 0 ? '$default_instance' : e).toLowerCase()
			if (!Object.prototype.hasOwnProperty.call(n._iq, e)) {
				n._iq[e] = { _q: [] }
				v(n._iq[e])
			}
			return n._iq[e]
		}
		e.amplitude = n
	})(window, document)
}

export interface AmplitudeAPI {
	init: (token: string) => void
	track: (event_name: string, properties?: any, options?: any) => void
	identify: (unique_id: string) => void
	Identify: any
	getInstance: () => any
}
