/**
 * Safari and iOS WebKit canvas snapshotting optimization.
 *
 * WebKit executes a synchronous main-thread CPU readback and software resample
 * whenever `createImageBitmap(canvas, { resizeWidth, resizeHeight })` is called,
 * causing >20ms frame drops on Retina canvases. Pre-blitting onto a pooled
 * GPU-backed staging canvas via `drawImage` and calling `createImageBitmap`
 * without resize options keeps snapshot latency near zero across Safari 16 and 17.
 */

export interface NavigatorLike {
	userAgent?: string
	vendor?: string
}

export interface CanvasLike {
	width: number
	height: number
}

export interface StagingContext2D {
	clearRect(x: number, y: number, width: number, height: number): void
	drawImage(
		image: unknown,
		dx: number,
		dy: number,
		dWidth: number,
		dHeight: number,
	): void
}

export interface StagingSurface extends CanvasLike {
	getContext(contextId: '2d'): StagingContext2D | null
}

export type SurfaceFactory = (
	width: number,
	height: number,
) => StagingSurface | null

export interface SafariBitmapShimConfig {
	targetScope: { createImageBitmap: typeof createImageBitmap }
	navigatorRef?: NavigatorLike | null
	surfaceFactory: SurfaceFactory
}

const NON_SAFARI_WEBKIT_TOKEN = /(?:Chrome|CriOS|FxiOS|EdgiOS|OPiOS|Android)/i
const SAFARI_TOKEN = /(?:Apple Computer|Safari)/i

/**
 * Identify Apple WebKit browsers (macOS Safari and iOS WebKit) while excluding
 * Desktop Chromium, Firefox, and Android WebView user agents.
 */
export function isSafariWebKit(nav?: NavigatorLike | null): boolean {
	if (!nav) {
		return false
	}
	const ua = String(nav.userAgent)
	if (NON_SAFARI_WEBKIT_TOKEN.test(ua)) {
		return false
	}
	return SAFARI_TOKEN.test(`${String(nav.vendor)} ${ua}`)
}

/**
 * Determine whether the bitmap source is a canvas requiring downscaled dimensions.
 */
export function resolveResizeTarget(
	source: unknown,
	options?: ImageBitmapOptions,
): CanvasLike | null {
	const dims = extractCanvasDimensions(source)
	if (!dims) {
		return null
	}
	if (!options) {
		return null
	}
	const width = Math.round(Number(options.resizeWidth || dims.width))
	const height = Math.round(Number(options.resizeHeight || dims.height))
	if (`${width}x${height}` === `${dims.width}x${dims.height}`) {
		return null
	}
	return { width, height }
}

/**
 * Extract positive width and height from a canvas-like source object.
 */
function extractCanvasDimensions(candidate: unknown): CanvasLike | null {
	if (!candidate) {
		return null
	}
	const maybe = candidate as Partial<CanvasLike>
	const minDim = Math.min(Number(maybe.width), Number(maybe.height))
	if (!(minDim > 0)) {
		return null
	}
	return {
		width: Number(maybe.width),
		height: Number(maybe.height),
	}
}

/**
 * Strip `resizeWidth`, `resizeHeight`, and `resizeQuality` after hardware pre-scaling.
 */
export function stripResizeOptions(
	options?: ImageBitmapOptions,
): ImageBitmapOptions | undefined {
	if (!options) {
		return undefined
	}
	const rest: ImageBitmapOptions = { ...options }
	delete rest.resizeWidth
	delete rest.resizeHeight
	delete rest.resizeQuality
	if (Object.keys(rest).length === 0) {
		return undefined
	}
	return rest
}

/**
 * Blit the source canvas onto the staging surface at the requested target dimensions.
 */
function blitToStagingSurface(
	surface: StagingSurface | null,
	source: ImageBitmapSource,
	target: CanvasLike,
): StagingSurface | null {
	if (!surface) {
		return null
	}
	surface.width = target.width
	surface.height = target.height
	const ctx = surface.getContext('2d')
	if (!ctx) {
		return null
	}
	ctx.clearRect(0, 0, target.width, target.height)
	ctx.drawImage(source, 0, 0, target.width, target.height)
	return surface
}

/**
 * Invoke native `createImageBitmap` with optional remaining options.
 */
function invokeNativeBitmap(
	scope: object,
	nativeCreate: typeof createImageBitmap,
	source: ImageBitmapSource,
	options?: ImageBitmapOptions,
): Promise<ImageBitmap> {
	if (options) {
		return nativeCreate.call(scope, source, options)
	}
	return nativeCreate.call(scope, source)
}

/**
 * Wrap `createImageBitmap` on Safari so canvas downscaling executes via GPU `drawImage`
 * prior to bitmap extraction rather than WebKit's blocking CPU resize path.
 */
export function installSafariCanvasBitmapShim(
	config: SafariBitmapShimConfig,
): () => void {
	const scope = config.targetScope
	const nativeCreate = scope.createImageBitmap
	if (!isSafariWebKit(config.navigatorRef)) {
		return () => {}
	}
	let pooledSurface: StagingSurface | null = null

	scope.createImageBitmap = function (
		image: ImageBitmapSource,
		options?: ImageBitmapOptions,
	): Promise<ImageBitmap> {
		const target = resolveResizeTarget(image, options)
		if (!target) {
			return invokeNativeBitmap(scope, nativeCreate, image, options)
		}
		if (!pooledSurface) {
			pooledSurface = config.surfaceFactory(target.width, target.height)
		}
		const blitted = blitToStagingSurface(pooledSurface, image, target)
		if (!blitted) {
			return invokeNativeBitmap(scope, nativeCreate, image, options)
		}
		return invokeNativeBitmap(
			scope,
			nativeCreate,
			blitted as unknown as ImageBitmapSource,
			stripResizeOptions(options),
		)
	} as typeof createImageBitmap

	return () => {
		scope.createImageBitmap = nativeCreate
	}
}
