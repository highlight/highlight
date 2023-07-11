import { formatPhoneNumber } from '@/pages/UserSettings/Auth/utils'

describe('formatPhoneNumber', () => {
	it('should handle all test cases', () => {
		expect(formatPhoneNumber('987-654-3210')).toEqual('+19876543210')
		expect(formatPhoneNumber('+1 987-654-3210')).toEqual('+19876543210')
		expect(formatPhoneNumber('+49 160-5556-417')).toEqual('+491605556417')
	})
})
