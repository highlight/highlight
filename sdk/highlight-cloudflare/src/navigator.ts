/**
 * Polyfill for the global navigator object.
 * In environments where navigator is undefined (e.g., Cloudflare Workers),
 * this module provides a minimal proxy that mimics some properties of the navigator.
 */

interface NavigatorPolyfill {
	userAgent: string
	platform?: string
	[key: string]: any
}

const defaultNavigator: NavigatorPolyfill = {
	userAgent: 'Cloudflare/Worker',
	platform: 'Cloudflare',
	['telemetry.distro.name']: '@highlight-run/cloudflare',
}

const navigatorShim: NavigatorPolyfill = new Proxy(defaultNavigator, {
	get(target, prop: string) {
		if (prop in target) {
			return target[prop]
		}
		return undefined
	},
})

// @ts-ignore
globalThis['navigator'] = navigatorShim
