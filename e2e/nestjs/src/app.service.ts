import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
	getHello(): string {
		console.log('hello, world!')
		console.warn('whoa there! ', Math.random())
		if (Math.random() < 0.2) {
			throw new Error(`a random error occurred! ${Math.random()}`)
		}
		return 'Hello World!'
	}
}
