import { CanvasRecorder } from './canvas-recorder'
import type { Highlight } from '../client'
import type { CanvasManagerInterface } from './types'

export class CanvasManager implements CanvasManagerInterface {
	private recorder: CanvasRecorder | null = null
	private isRecording = false

	constructor(private highlight: Highlight) {}

	startRecording() {
		if (this.isRecording) return
		
		this.recorder = new CanvasRecorder(this.highlight.options)
		this.isRecording = true
	}

	stopRecording() {
		if (!this.isRecording) return
		
		this.isRecording = false
		this.recorder = null
	}

	snapshot(canvas: HTMLCanvasElement) {
		if (!this.isRecording || !this.recorder) return
		
		this.recorder.snapshot(canvas)
	}
}