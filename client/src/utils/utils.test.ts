import { stringify } from './utils'

describe('utils', () => {
	it('stringify', () => {
		const result = stringify(1)

		expect(result).to.eq('1')
	})
})
