import { formatNumber } from './numbers'

describe('formatNumber', () => {
	const CASES: [number, string][] = [
		[0, '0'],
		[5, '5'],
		[999, '999'],
		[1_500, '1.5K'],
		[1_000_000, '1M'],
		[2_500_000_000, '2.5B'],
		[1_000_000_000_000, '1T'],
		[999_000_000_000_000, '999T'],
		// At and beyond 1000^5 the magnitude exceeds the largest unit ("T").
		// The index must be clamped to the last unit instead of reading past
		// the end of the `sizes` array (which produced "undefined"/NaN output).
		[1_000_000_000_000_000, '1000T'],
		[5_000_000_000_000_000, '5000T'],
		[1_000_000_000_000_000_000, '1000000T'],
	]

	it.each(CASES)('formats %d as %s', (input, expected) => {
		expect(formatNumber(input)).toBe(expected)
	})

	it('respects the decimals argument', () => {
		expect(formatNumber(1_234_500_000_000_000, 2)).toBe('1235T')
		expect(formatNumber(1_500, 0)).toBe('2K')
	})

	it('never renders an undefined unit suffix for very large numbers', () => {
		const result = formatNumber(9.99e17)
		expect(result).not.toContain('undefined')
		expect(result).not.toContain('NaN')
		expect(result.endsWith('T')).toBe(true)
	})
})
