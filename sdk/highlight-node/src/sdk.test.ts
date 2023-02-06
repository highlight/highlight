import { NextApiHandler } from 'next'
import { H, HIGHLIGHT_REQUEST_HEADER } from './sdk.js'

describe('parseHeaders', () => {
	it('returns session id and request id from the headers', () => {
		expect(
			H.parseHeaders({ [HIGHLIGHT_REQUEST_HEADER]: '1234/5678' }),
		).toMatchObject({ secureSessionId: '1234', requestId: '5678' })
	})

	it('returns undefined if headers is empty', async () => {
		expect(H.parseHeaders({})).toBeUndefined()
	})

	it('returns session if request is invalid', async () => {
		expect(
			H.parseHeaders({ [HIGHLIGHT_REQUEST_HEADER]: 'not valid!' }),
		).toMatchObject({ secureSessionId: 'not valid!', requestId: undefined })
	})
})
