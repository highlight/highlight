import { H, HIGHLIGHT_REQUEST_HEADER } from './sdk.js'
import { describe, expect, it } from 'vitest'

describe('parseHeaders', () => {
	H.init({ projectID: '1' })

	it('returns session id and request id from the headers', () => {
		expect(
			H.parseHeaders({ [HIGHLIGHT_REQUEST_HEADER]: '1234/5678' }),
		).toMatchObject({ secureSessionId: '1234', requestId: '5678' })
	})

	it('returns undefined if headers is empty', async () => {
		expect(H.parseHeaders({})).toMatchObject({
			secureSessionId: undefined,
			requestId: undefined,
		})
	})

	it('returns session if request is invalid', async () => {
		expect(
			H.parseHeaders({ [HIGHLIGHT_REQUEST_HEADER]: 'not valid!' }),
		).toMatchObject({ secureSessionId: 'not valid!', requestId: undefined })
	})
})
