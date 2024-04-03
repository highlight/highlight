import { Session } from '@graph/schemas'

import { sessionIsBackfilled } from './utils'

let session: Session

describe('sessionIsBackfilled', () => {
	beforeEach(() => {
		session = {
			client_id: 'abc123',
			identifier: 'jay@highlight.io',
			identified: false,
		} as Session
	})

	it('returns false if there is no session', () => {
		expect(sessionIsBackfilled(undefined)).toBe(false)
	})

	it('returns false if there is no identifier', () => {
		session.identifier = ''
		expect(sessionIsBackfilled(session)).toBe(false)
	})

	it('returns true if client_id and identifier are set, but identified is false', () => {
		expect(sessionIsBackfilled(session)).toBe(true)
	})
})
