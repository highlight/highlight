import React, { useEffect, useRef } from 'react'

import { Box } from '@/../../packages/ui'

interface Navigator {
	getUserMedia(
		options: { video?: boolean; audio?: boolean },
		success: (stream: MediaSource) => void,
		error?: (error: string) => void,
	): void
}

export const CanvasPage = function () {
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const video = document.querySelector('#webcam')! as HTMLVideoElement
		const n = navigator as any as Navigator
		if (n.getUserMedia) {
			n.getUserMedia(
				{
					video: true,
				},
				function (stream) {
					video.srcObject = stream
				},
				() => {
					console.error('denied')
				},
			)
		}
	}, [])

	useEffect(() => {
		const canvases = ref.current?.getElementsByTagName('canvas')
		if (!canvases) return
		for (const canvas of canvases) {
			const rand = Math.random()
			if (rand < 0.25) {
				const ctx = canvas.getContext('bitmaprenderer')
				if (!ctx) continue
				createImageBitmap(
					ref.current
						?.getElementsByClassName('sample-image')
						.item(0) as HTMLImageElement,
					{
						resizeQuality: 'low',
						resizeWidth: 128,
						resizeHeight: 128,
					},
				).then((bitmap) => {
					ctx.transferFromImageBitmap(bitmap)
				})
			} else if (rand < 0.5) {
				const gl = canvas.getContext('webgl')
				if (!gl) continue
				gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
				for (let i = 0; i < 100; i++) {
					setInterval(() => {
						const color = [
							Math.random(),
							Math.random(),
							Math.random(),
						]
						gl.clearColor(color[0], color[1], color[2], 1.0)
						gl.clear(gl.COLOR_BUFFER_BIT)
					}, i)
				}
			} else if (rand < 0.75) {
				const gl2 = canvas.getContext('webgl2')
				if (!gl2) continue
				gl2.viewport(
					0,
					0,
					gl2.drawingBufferWidth,
					gl2.drawingBufferHeight,
				)
				for (let i = 0; i < 100; i++) {
					setInterval(() => {
						const color = [
							Math.random(),
							Math.random(),
							Math.random(),
						]
						gl2.clearColor(color[0], color[1], color[2], 1.0)
						gl2.clear(gl2.COLOR_BUFFER_BIT)
					}, i)
				}
			} else {
				const ctx = canvas.getContext('2d')
				if (!ctx) continue
				for (let i = 0; i < 1000; i++) {
					setInterval(() => {
						const randomColor = Math.floor(
							Math.random() * 16777215,
						).toString(16)

						ctx.fillStyle = `#${randomColor}`
						ctx.beginPath()
						ctx.arc(
							Math.random() * canvas.width,
							Math.random() * canvas.height,
							10,
							0,
							2 * Math.PI,
						)
						ctx.fill()
					}, i)
				}
			}
		}
	}, [])

	return (
		<Box ref={ref} width="full" height="full">
			<Box display="flex" width="full">
				<Box border="dividerStrong">
					<video
						width={640}
						height={480}
						preload="metadata"
						autoPlay={true}
						crossOrigin="anonymous"
						src="https://static.highlight.io/dev/BigBuckBunny.mp4"
					></video>
				</Box>
				<Box border="dividerStrong">
					<canvas width={640} height={480} className=":hover" />
				</Box>
				<Box border="dividerStrong">
					<video
						autoPlay
						id="webcam"
						width={640}
						height={480}
					></video>
				</Box>
			</Box>
		</Box>
	)
}
