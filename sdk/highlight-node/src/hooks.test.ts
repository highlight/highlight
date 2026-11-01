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

	it('does not mutate the original object', () => {
		const original = BigInt(42)
		const obj = { value: original, nested: { count: BigInt(7) } }
		safeStringify(obj)
		expect(obj.value).toBe(original)
		expect(typeof obj.value).toBe('bigint')
		expect(obj.nested.count).toBe(BigInt(7))
		expect(typeof obj.nested.count).toBe('bigint')
	})

	it('does not mutate arrays in the original object', () => {
		const arr = [BigInt(1), BigInt(2)]
		const obj = { items: arr }
		safeStringify(obj)
		expect(typeof obj.items[0]).toBe('bigint')
		expect(typeof obj.items[1]).toBe('bigint')
	})
})
