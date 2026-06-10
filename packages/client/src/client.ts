import { CanvasManager } from './listeners/canvas'

export class Highlight {
	private canvasManager: CanvasManager
	
	constructor(private options: HighlightOptions) {
		this.canvasManager = new CanvasManager(this)
	}
	
	// ... other methods
	
	snapshot(canvas: HTMLCanvasElement) {
		this.canvasManager.snapshot(canvas)
	}
	
	// ... other methods
}

export interface HighlightOptions {
	enableCanvasRecording?: boolean
	canvasMaxSnapshotDimension?: number
	canvasQuality?: 'low' | 'medium' | 'high' | 'pixelated'
	canvasFactor?: number
	canvasClearWebGLBuffer?: boolean
	// ... other options
}