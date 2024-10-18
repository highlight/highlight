import { safeStringify } from './hooks'
import { describe, expect, it } from 'vitest'

describe('safeStringify', () => {
	it('ensure safeStringify can handle bigints', async () => {
		const obj = {
			hello: 'world',
			foo: BigInt(9007199254740991),
			bar: Symbol('symbolTest'),
			another: {
				hello: 'world',
				foo: BigInt(123),
				deep: { deeper: BigInt(456) },
			},
			arrayTest: [1, 2, 3, BigInt(789)],
		}
		const result = safeStringify(obj)
		expect(JSON.parse(result)).toStrictEqual({
			another: { deep: { deeper: '456' }, foo: '123', hello: 'world' },
			arrayTest: [1, 2, 3, '789'],
			foo: '9007199254740991',
			hello: 'world',
		})
	})
})
