import { describe, expect, it } from 'vitest'

import { selectValuesToStrings } from './selectUtils'

describe('selectValuesToStrings', () => {
	it('preserves plain string array values', () => {
		expect(selectValuesToStrings(['production', 'staging'])).toEqual([
			'production',
			'staging',
		])
	})

	it('normalizes UI Select option values back to strings', () => {
		expect(
			selectValuesToStrings([
				{ name: 'Production', value: 'production' },
				{ name: 'Staging', value: 'staging' },
			]),
		).toEqual(['production', 'staging'])
	})

	it('normalizes generated creatable values emitted by UI Select', () => {
		expect(
			selectValuesToStrings([
				{ name: 'user.email', value: 'user.email' },
			]),
		).toEqual(['user.email'])
	})

	it('preserves encoded property values emitted by UI Select', () => {
		const propertyValue = 'property-id:$&browser:$&chrome'

		expect(
			selectValuesToStrings([
				{ name: 'browser: chrome', value: propertyValue },
			]),
		).toEqual([propertyValue])
	})

	it('normalizes numeric option values to strings', () => {
		expect(selectValuesToStrings([{ name: 'One', value: 1 }])).toEqual([
			'1',
		])
	})

	it('falls back to an empty array for non-array values', () => {
		expect(selectValuesToStrings(undefined)).toEqual([])
		expect(selectValuesToStrings(null)).toEqual([])
	})
})
