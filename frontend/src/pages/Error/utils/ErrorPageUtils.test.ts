import { GetErrorGroupQuery } from '@graph/operations'

import {
	GetErrorGroupQueryMock1,
	GetErrorGroupQueryMock2,
} from './__mocks__/GetErrorGroupQuery'
import { getErrorGroupFields } from './ErrorPageUtils'

describe('ErrorPageUtils', () => {
	describe('getErrorGroupMetadata', () => {
		it('should handle an undefined error group', () => {
			const result = getErrorGroupFields({
				error_group: {
					fields: undefined,
				},
			} as GetErrorGroupQuery)

			expect(result).toStrictEqual([])
		})

		it('should handle an error group with duplicate fields', () => {
			const result = getErrorGroupFields(
				GetErrorGroupQueryMock1 as GetErrorGroupQuery,
			)

			expect(result).toStrictEqual([
				{ name: 'browser', value: 'Safari, Chrome, Firefox' },
				{ name: 'os_name', value: 'Mac OS X, iPhone OS, OS' },
			])
		})

		it('should group by the same keys', () => {
			const result = getErrorGroupFields(
				GetErrorGroupQueryMock2 as GetErrorGroupQuery,
			)

			expect(result).toStrictEqual([
				{
					name: 'browser',
					value: 'Android, Chrome, Safari, Firefox, https:, Chromium',
				},
				{
					name: 'os_name',
					value: 'Android, Windows, Linux, Mac OS X, CrOS x86_64',
				},
			])
		})
	})
})
