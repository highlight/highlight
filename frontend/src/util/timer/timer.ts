const timers: { [key: string]: number } = {}

export function timerStart(name: string) {
	timers[name + '_start'] = window.performance.now()
}

export function timerEnd(name: string) {
	if (!timers[name + '_start']) return undefined
	const time = window.performance.now() - timers[name + '_start']
	const amount = (timers[name + '_amount'] = timers[name + '_amount']
		? timers[name + '_amount'] + 1
		: 1)
	const sum = (timers[name + '_sum'] = timers[name + '_sum']
		? timers[name + '_sum'] + time
		: time)
	timers[name + '_avg'] = sum / amount
	delete timers[name + '_start']
	return time
}
