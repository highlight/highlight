import { getMajorVersion } from './utils'

describe('getMajorVersion', () => {
	const CASES = [
		['1.2.3', '1'],
		['5.0', '5'],
		['9.2.3.1', '9'],
		['0', '0'],
		['', ''],
	]

	it.each(CASES)(
		'should get the major version from a version string',
		(input, expected) => {
			const result = getMajorVersion(input)

			expect(result).toBe(expected)
		},
	)
})
