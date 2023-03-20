import { Injectable } from '@nestjs/common'
import { H } from '@highlight-run/nest'

@Injectable()
export class AppService {
	getHello(): string {
		console.log('hello, world!')
		console.warn('whoa there! ', Math.random())
		if (Math.random() < 0.2) {
			throw new Error(`a random error occurred! ${Math.random()}`)
		} else if (Math.random() < 0.2) {
			H.consumeError(new Error(`oh no! ${Math.random()}`))
		}
		return 'Hello World!'
	}
}
