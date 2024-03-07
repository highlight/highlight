import { Box } from '@highlight-run/ui/components'
import { CSSProperties, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/Button'

interface Navigator {
	getUserMedia(
		options: { video?: boolean; audio?: boolean },
		success: (stream: MediaSource) => void,
		error?: (error: string) => void,
	): void
}

export const CanvasPage = function () {
	const ref = useRef<HTMLDivElement>(null)
	const [numCanvases, setNumCanvases] = useState<number>(0)
	const [canvasStyle, setCanvasStyle] = useState<CSSProperties>()

	const onMouseMove = () => {
		setCanvasStyle((s) => ({
			display: 'block',
			width: Number(s?.width || 500) + (Math.random() < 0.5 ? 1 : -1) * 1,
			height:
				Number(s?.height || 500) + (Math.random() < 0.5 ? 1 : -1) * 1,
			touchAction: 'none',
			outline: 'none',
			cursor: `url(data:image/png;base64,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), pointer`,
			background: `linear-gradient(rgb(${255 * Math.random()}, ${
				255 * Math.random()
			}, ${255 * Math.random()}) 0%, rgb(${255 * Math.random()}, ${
				255 * Math.random()
			}, ${255 * Math.random()}) 100%)`,
		}))
	}

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
				const ctx = canvas.getContext('bitmaprenderer')!
				const img = ref.current
					?.getElementsByClassName('sample-image')
					.item(0) as HTMLImageElement
				img.onload = function () {
					createImageBitmap(img, {
						resizeQuality: 'low',
						resizeWidth: 128,
						resizeHeight: 128,
					}).then((bitmap) => {
						ctx.transferFromImageBitmap(bitmap)
					})
				}
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
	}, [numCanvases])

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
						src="https://static.highlight.io/dev/BigBuckBunny.mp4?expires=123&signature=a1b2c3&x-amz-security-token=foo&bar=baz"
					></video>
				</Box>
				<Box border="dividerStrong">
					{Array(numCanvases)
						.fill(0)
						.map((_, i) => (
							<canvas
								id={`canvas-${i}`}
								key={`canvas-${i}`}
								style={canvasStyle}
								onMouseMove={onMouseMove}
								tabIndex={8888}
								width={640}
								height={480}
								className=":hover"
							/>
						))}
					<img
						className="sample-image"
						src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Fiore_con_petali_arancioni_SVG.svg"
						width={512}
						height={512}
						alt="sample-image"
					/>
				</Box>
				<Box border="dividerStrong">
					<video
						autoPlay
						id="webcam"
						width={640}
						height={480}
					></video>
				</Box>
				<Box border="dividerStrong">
					<Button
						trackingId="canvasIncrement"
						onClick={() => setNumCanvases((n) => n + 1)}
					/>
				</Box>
			</Box>
		</Box>
	)
}
