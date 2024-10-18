import { Rewrite } from 'next/dist/lib/load-custom-routes'
import { withHighlightConfig } from './with-highlight-config'
import { describe, expect, it } from 'vitest'

describe('withHighlightConfig', () => {
	let defaultRewrite = [
		{
			destination: 'https://pub.highlight.io',
			source: '/highlight-events',
		},
	]

	it('creates new rewrites if none exist', async () => {
		expect(
			await (
				await withHighlightConfig({}, { uploadSourceMaps: true })
			).rewrites!(),
		).toMatchObject(defaultRewrite)
	})

	it('adds to a wrapped rewrites array', async () => {
		const testEntry = {
			source: '/test-rewrite',
			destination: 'http://www.example.com',
		}
		const rewrites: () => Promise<Rewrite[]> = () =>
			Promise.resolve([testEntry])

		const expected = [testEntry, ...defaultRewrite]
		expect(
			await (
				await withHighlightConfig({ rewrites })
			).rewrites!(),
		).toMatchObject(expected)
	})

	it('adds to a wrapped rewrites object', async () => {
		const testEntry = {
			source: '/test-rewrite',
			destination: 'http://www.example.com',
		}
		const rewrites: () => Promise<{
			beforeFiles: Rewrite[]
			afterFiles: Rewrite[]
			fallback: Rewrite[]
		}> = () =>
			Promise.resolve({
				beforeFiles: [testEntry],
				afterFiles: [],
				fallback: [testEntry],
			})

		const expected = {
			beforeFiles: [testEntry],
			fallback: [testEntry],
		}
		expect(
			await (
				await withHighlightConfig({ rewrites })
			).rewrites!(),
		).toMatchObject(expected)
	})

	it('assumes rewrites may not have all fields defined', async () => {
		const testEntry = {
			source: '/test-rewrite',
			destination: 'http://www.example.com',
		}
		const rewrites: () => Promise<{
			beforeFiles: Rewrite[]
			afterFiles: Rewrite[]
			fallback: Rewrite[]
		}> =
			// @ts-expect-error
			() => Promise.resolve({ fallback: [testEntry] })

		const expected = {
			beforeFiles: undefined,
			fallback: [testEntry],
		}
		expect(
			await (
				await withHighlightConfig({ rewrites })
			).rewrites!(),
		).toMatchObject(expected)
	})

	it('assumes rewrites may return undefined', async () => {
		const testEntry = {
			source: '/test-rewrite',
			destination: 'http://www.example.com',
		}
		const rewrites: () => Promise<{
			beforeFiles: Rewrite[]
			afterFiles: Rewrite[]
			fallback: Rewrite[]
		}> =
			// @ts-expect-error
			() => Promise.resolve(undefined)

		expect(
			await (
				await withHighlightConfig({ rewrites })
			).rewrites!(),
		).toMatchObject(defaultRewrite)
	})
})
