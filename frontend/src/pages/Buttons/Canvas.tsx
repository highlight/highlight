import { useRef } from 'react'

const DO_NOT_USE_Canvas = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)

	const onClick = () => {
		const canvas = canvasRef.current
		if (canvas) {
			const ctx = canvas.getContext('2d')
			if (ctx) {
				for (let i = 0; i < 1000; i++) {
					setInterval(() => {
						const randomColor = Math.floor(
							Math.random() * 16777215,
						).toString(16)

						ctx.fillStyle = `#${randomColor}`
						ctx.beginPath()
						ctx.arc(
							Math.random() * 300,
							Math.random() * 300,
							10,
							0,
							2 * Math.PI,
						)
						ctx.fill()
					}, i)
				}
			}
		}
	}

	return (
		<div>
			<canvas
				style={{ width: 1000, height: 1000 }}
				ref={canvasRef}
			></canvas>
			<button id="draw" onClick={onClick}>
				DRAW
			</button>
		</div>
	)
}

export default DO_NOT_USE_Canvas
