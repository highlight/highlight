import { describe, expect, it, vi } from 'vitest'
import {
	installSafariCanvasBitmapShim,
	isSafariWebKit,
	resolveResizeTarget,
	StagingContext2D,
	StagingSurface,
	stripResizeOptions,
} from '../utils/safari-canvas-bitmap'

function createMockSurface(): {
	surface: StagingSurface
	ctx: StagingContext2D
} {
	const ctx: StagingContext2D = {
		clearRect: vi.fn(),
		drawImage: vi.fn(),
	}
	const surface: StagingSurface = {
		width: 0,
		height: 0,
		getContext: vi.fn(() => ctx),
	}
	return { surface, ctx }
}

describe('Safari canvas snapshotting bitmap shim', () => {
	it('identifies macOS Safari and iOS WebKit while excluding Chromium and Firefox', () => {
		expect(
			isSafariWebKit({
				vendor: 'Apple Computer, Inc.',
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
			}),
		).toBe(true)

		expect(
			isSafariWebKit({
				vendor: 'Google Inc.',
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
			}),
		).toBe(false)

		expect(
			isSafariWebKit({
				vendor: 'Apple Computer, Inc.',
				userAgent:
					'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/117.0.5938.108 Mobile/15E148 Safari/604.1',
			}),
		).toBe(false)
	})

	it('resolves resize dimensions only when target differs from source canvas dimensions', () => {
		const source = { width: 2114, height: 1468 }
		expect(
			resolveResizeTarget(source, {
				resizeWidth: 360,
				resizeHeight: 250,
			}),
		).toEqual({ width: 360, height: 250 })

		expect(
			resolveResizeTarget(source, {
				resizeWidth: 2114,
				resizeHeight: 1468,
			}),
		).toBeNull()
	})

	it('strips resize options while preserving unrelated ImageBitmapOptions fields', () => {
		expect(
			stripResizeOptions({
				resizeWidth: 360,
				resizeHeight: 250,
				resizeQuality: 'low',
			}),
		).toBeUndefined()

		expect(
			stripResizeOptions({
				resizeWidth: 360,
				resizeHeight: 250,
				imageOrientation: 'flipY',
			}),
		).toEqual({ imageOrientation: 'flipY' })
	})

	it('pre-scales onto a pooled staging canvas in Safari before calling native createImageBitmap', async () => {
		const fakeBitmap = { width: 360, height: 250, close: vi.fn() } as unknown as ImageBitmap
		const nativeSpy = vi.fn(async () => fakeBitmap)
		const scope = {
			createImageBitmap: nativeSpy as unknown as typeof createImageBitmap,
		}
		const { surface, ctx } = createMockSurface()

		const restore = installSafariCanvasBitmapShim({
			targetScope: scope,
			navigatorRef: {
				vendor: 'Apple Computer, Inc.',
				userAgent: 'Mozilla/5.0 Version/16.5 Safari/605.1.15',
			},
			surfaceFactory: (w, h) => {
				surface.width = w
				surface.height = h
				return surface
			},
		})

		const sourceCanvas = { width: 2114, height: 1468 } as unknown as ImageBitmapSource
		const result = await scope.createImageBitmap(sourceCanvas, {
			resizeWidth: 360,
			resizeHeight: 250,
		})

		expect(result).toBe(fakeBitmap)
		expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 360, 250)
		expect(ctx.drawImage).toHaveBeenCalledWith(sourceCanvas, 0, 0, 360, 250)
		expect(nativeSpy).toHaveBeenCalledTimes(1)
		expect(nativeSpy).toHaveBeenCalledWith(surface)

		restore()
		expect(scope.createImageBitmap).toBe(nativeSpy)
	})
})
