import { datadogRum } from '@datadog/browser-rum'

export const timedCall = (metric: string, fn: CallableFunction) => {
	const start = window.performance?.now()
	let exception: Error | undefined
	try {
		fn()
	} catch (e) {
		exception = e as Error
	} finally {
		const name = `${metric}/duration-ms`
		const dur = window.performance?.now() - start
		window.H.metrics([
			{
				name,
				value: dur,
				tags: [
					{ name: 'success', value: exception ? 'false' : 'true' },
				],
			},
		])
		datadogRum.addTiming(name, dur)
	}
}
