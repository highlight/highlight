import { datadogRum } from '@datadog/browser-rum'

export const timedCall = (
	metric: string,
	fn: CallableFunction,
	tags?: { name: string; value: string }[],
) => {
	const start = window.performance?.now()
	try {
		return fn()
	} finally {
		const name = `${metric}/duration-ms`
		const dur = window.performance?.now() - start
		window.H.metrics([
			{
				name,
				value: dur,
				tags: tags || [],
			},
		])
		datadogRum.addTiming(ddSanitize(name), dur)
	}
}

export const timedCallback = <T extends Function>(
	metric: string,
	fn: T,
	tags?: { name: string; value: string }[],
): (() => void) => {
	let lastUpdate = window.performance?.now()
	return () => {
		try {
			return fn()
		} finally {
			const name = `${metric}/duration-ms`
			const now = window.performance?.now()
			const dur = now - lastUpdate
			lastUpdate = now
			window.H.metrics([
				{
					name,
					value: dur,
					tags: tags || [],
				},
			])
			datadogRum.addTiming(ddSanitize(name), dur)
		}
	}
}

// Datadog RUM does not allow timing names with `/`
function ddSanitize(name: string): string {
	return name.replaceAll('/', '_')
}
