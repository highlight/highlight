import { bytesToPrettyString, validateEmail } from './index'

describe('validateEmail', () => {
	const CASES = [
		['', false],
		['.@highlight.run', false],
		['foo@bar.', false],
		['foo', false],
		['foo@Æ.run', false],
		['¥@highlight.run', true],
		['foo@highlight.run', true],
	]

	it.each(CASES)('should validate %s as %s', (email, expected) => {
		expect(validateEmail(email as string)).toBe(expected as Boolean)
	})
})

describe('bytesToPrettyString', () => {
	// 1000 bytes sits exactly on the boundary between the two modes: with a
	// 1024 (binary) divisor it stays under the threshold and renders as raw
	// bytes, while with a 1000 (decimal/SI) divisor it rolls over to kB. So
	// the input cleanly distinguishes which divisor the flag selected.
	it('uses a 1024 divisor when use1024 is true', () => {
		expect(bytesToPrettyString(1000, true)).toBe('1000 B')
	})

	it('uses a 1000 divisor when use1024 is false', () => {
		expect(bytesToPrettyString(1000, false)).toBe('1.0 kB')
	})
})
