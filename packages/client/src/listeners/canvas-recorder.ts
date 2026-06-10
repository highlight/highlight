import type { HighlightOptions } from '../client'

export class CanvasRecorder {
	private snapshots: Array<{
		timestamp: number
		data: string
	}> = []

	constructor(private options: HighlightOptions) {}

	async snapshot(canvas: HTMLCanvasElement) {
		const startTime = performance.now()
		
		try {
			// Create a smaller canvas for snapshot to reduce data size
			const maxDimension = this.options.canvasMaxSnapshotDimension || 480
			const scale = Math.min(
				maxDimension / canvas.width,
				maxDimension / canvas.height,
				1
			)
			
			const width = Math.floor(canvas.width * scale)
			const height = Math.floor(canvas.height * scale)
			
			// Create offscreen canvas for resizing
			const offscreen = document.createElement('canvas')
			offscreen.width = width
			offscreen.height = height
			
			const ctx = offscreen.getContext('2d')
			if (!ctx) return
			
			// Draw the original canvas scaled down
			ctx.drawImage(canvas, 0, 0, width, height)
			
			let blob: Blob | null = null
			
			// Try different methods for better Safari performance
			if (this.options.canvasQuality === 'pixelated') {
				// For pixelated quality, use getImageData which is faster in Safari
				const imageData = ctx.getImageData(0, 0, width, height)
				blob = await this.imageDataToBlob(imageData)
			} else {
				// For other qualities, try toBlob first, then fallback
				blob = await new Promise<Blob | null>((resolve) => {
					offscreen.toBlob(
						(b) => resolve(b),
						'image/webp',
						this.options.canvasQuality === 'low' ? 0.5 : 0.8
					)
				})
				
				// If toBlob fails or is slow, fallback to getImageData
				if (!blob) {
					const imageData = ctx.getImageData(0, 0, width, height)
					blob = await this.imageDataToBlob(imageData)
				}
			}
			
			if (blob) {
				const reader = new FileReader()
				reader.onloadend = () => {
					const base64data = reader.result as string
					this.snapshots.push({
						timestamp: Date.now(),
						data: base64data
					})
					
					// Log performance for debugging
					const duration = performance.now() - startTime
					if (duration > 10) {
						console.warn(`Canvas snapshot took ${duration.toFixed(2)}ms`)
					}
				}
				reader.readAsDataURL(blob)
			}
			
		} catch (error) {
			console.error('Canvas snapshot failed:', error)
		}
	}

	private async imageDataToBlob(imageData: ImageData): Promise<Blob> {
		// Create a temporary canvas to convert ImageData to Blob
		const canvas = document.createElement('canvas')
		canvas.width = imageData.width
		canvas.height = imageData.height
		const ctx = canvas.getContext('2d')
		if (!ctx) throw new Error('Could not get canvas context')
		
		ctx.putImageData(imageData, 0, 0)
		
		return new Promise((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (blob) resolve(blob)
					else reject(new Error('Could not create blob'))
				},
				'image/webp',
				0.8
			)
		})
	}

	getSnapshots() {
		return this.snapshots
	}

	clearSnapshots() {
		this.snapshots = []
	}
}