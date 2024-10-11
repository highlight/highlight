export class Logger {
	debug: boolean | undefined
	name: string | undefined

	constructor(debug?: boolean, name?: string) {
		this.debug = debug
		this.name = name
	}

	log(...data: any[]) {
		if (this.debug) {
			let prefix = `[${Date.now()}]`
			if (this.name) {
				prefix += ` - ${this.name}`
			}
			console.log.apply(console, [prefix, ...data])
		}
	}
}
