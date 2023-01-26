import { Rewrite } from 'next/dist/lib/load-custom-routes.js'
import { withHighlightConfig } from './withHighlightConfig.js'

describe('withHighlightConfig', () => {
	let defaultRewrite: {
		beforeFiles: Rewrite[]
		afterFiles: Rewrite[]
		fallback: Rewrite[]
	} = {
		afterFiles: [
			{
				destination: 'https://pub.highlight.run',
				source: '/highlight-events',
			},
		],
		beforeFiles: [],
		fallback: [],
	}

	it('creates new rewrites if none exist', async () => {
		expect(
			await withHighlightConfig({}, { uploadSourceMaps: true })
				.rewrites!(),
		).toMatchObject(defaultRewrite)
	})

	it('adds to a wrapped rewrites array', async () => {
		const testEntry = {
			source: '/test-rewrite',
			destination: 'http://www.example.com',
		}
		const rewrites: () => Promise<Rewrite[]> = () =>
			Promise.resolve([testEntry])

		const expected = { ...defaultRewrite }
		expected.afterFiles = [testEntry, ...expected.afterFiles]
		expect(
			await withHighlightConfig({ rewrites }).rewrites!(),
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

		const expected = { ...defaultRewrite }
		expected.beforeFiles = [testEntry]
		expected.fallback = [testEntry]
		expect(
			await withHighlightConfig({ rewrites }).rewrites!(),
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

		const expected = { ...defaultRewrite }
		// @ts-expect-error
		expected.beforeFiles = undefined
		expected.fallback = [testEntry]
		expect(
			await withHighlightConfig({ rewrites }).rewrites!(),
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
			await withHighlightConfig({ rewrites }).rewrites!(),
		).toMatchObject(defaultRewrite)
	})
})
