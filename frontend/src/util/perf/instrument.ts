export const timedCall = (metric: string, fn: CallableFunction) => {
	const start = window.performance?.now()
	let exception: Error | undefined
	try {
		fn()
	} catch (e) {
		exception = e as Error
	} finally {
		const dur = window.performance?.now() - start
		window.H.metrics([
			{
				name: `${metric}/duration-ms`,
				value: dur,
				tags: [
					{ name: 'success', value: exception ? 'false' : 'true' },
				],
			},
		])
	}
}
