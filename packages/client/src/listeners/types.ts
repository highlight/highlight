export interface CanvasManagerInterface {
	startRecording(): void
	stopRecording(): void
	snapshot(canvas: HTMLCanvasElement): void
}

export interface CanvasSnapshotOptions {
	canvasMaxSnapshotDimension?: number
	canvasQuality?: 'low' | 'medium' | 'high' | 'pixelated'
	canvasFactor?: number
	canvasClearWebGLBuffer?: boolean
}