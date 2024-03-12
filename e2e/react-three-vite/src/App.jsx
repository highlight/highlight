/* eslint-disable react/no-unknown-property,react/prop-types */
// https://cydstumpel.nl/

import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
	Image,
	Environment,
	ScrollControls,
	useScroll,
	useTexture,
} from '@react-three/drei'
import { easing } from 'maath'
import { H } from 'highlight.run'
import './util'

export const App = () => {
	const [renderMode] = useState('demand')
	const [dpr] = useState([0, 1])
	const canvasRef = useRef()

	return (
		<Canvas
			id="scaffcanvas"
			style={{ userSelect: 'none', zIndex: 1 }}
			gl={{ pixelRatio: window.devicePixelRatio }}
			dpr={dpr}
			frameloop={renderMode}
			ref={canvasRef}
			camera={{ position: [0, 0, 100], fov: 15 }}
		>
			<fog />
			<ScrollControls pages={4} infinite>
				<Rig rotation={[0, 0, 0.15]} canvasRef={canvasRef}>
					<Carousel canvasRef={canvasRef} />
				</Rig>
				<Banner position={[0, -0.15, 0]} canvasRef={canvasRef} />
			</ScrollControls>
			<Environment preset="dawn" background blur={0.5} />
			<HighlightCanvas canvasRef={canvasRef} />
		</Canvas>
	)
}

function HighlightCanvas() {
	useEffect(() => {
		sessionStorage.clear()
		localStorage.clear()
		H.init('1', {
			enableCanvasRecording: true,
			samplingStrategy: {
				canvasManualSnapshot: 30,
				canvasQuality: 'pixelated',
				canvasFactor: 0.5,
				canvasMaxSnapshotDimension: 480,
				canvasClearWebGLBuffer: false,
			},
			debug: { clientInteractions: true, domRecording: true },
		})
		H.identify('vadim@highlight.io')
	}, [])
	return null
}

function Rig({ ...props }) {
	const ref = useRef()
	const scroll = useScroll()
	useFrame((state, delta) => {
		ref.current.rotation.y = -scroll.offset * (Math.PI * 2) // Rotate contents
		state.events.update() // Raycasts every frame rather than on pointer-move
		easing.damp3(
			state.camera.position,
			[-state.pointer.x * 2, state.pointer.y + 1.5, 10],
			0.3,
			delta,
		) // Move camera
		state.camera.lookAt(0, 0, 0) // Look at center
	})
	return (
		<group
			ref={ref}
			// onAfterRender={() => {
			// 	H.snapshot(canvasRef.current)
			// }}
			{...props}
		/>
	)
}

function Carousel({ radius = 1.4, count = 1, canvasRef }) {
	return Array.from({ length: count }, (_, i) => (
		<Card
			canvasRef={canvasRef}
			key={i}
			url={`/img${Math.floor(i % 10) + 1}_.jpg`}
			position={[
				Math.sin((i / count) * Math.PI * 2) * radius,
				0,
				Math.cos((i / count) * Math.PI * 2) * radius,
			]}
			rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
		/>
	))
}

function Card({ url, canvasRef, ...props }) {
	const ref = useRef()
	const [hovered, hover] = useState(false)
	const pointerOver = (e) => (e.stopPropagation(), hover(true))
	const pointerOut = () => hover(false)
	useFrame((state, delta) => {
		easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta)
		easing.damp(
			ref.current.material,
			'radius',
			hovered ? 0.25 : 0.1,
			0.2,
			delta,
		)
		easing.damp(ref.current.material, 'zoom', hovered ? 1 : 1.5, 0.2, delta)
	})
	return (
		<Image
			ref={ref}
			url={url}
			transparent
			side={THREE.DoubleSide}
			onPointerOver={pointerOver}
			onPointerOut={pointerOut}
			onAfterRender={() => {
				H.snapshot(canvasRef.current)
			}}
			{...props}
		>
			<bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
		</Image>
	)
}

function Banner(props) {
	const ref = useRef()
	const texture = useTexture('/img1_.jpg')
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping
	const scroll = useScroll()
	useFrame((state, delta) => {
		ref.current.material.time.value += Math.abs(scroll.delta) * 4
		ref.current.material.map.offset.x += delta / 2
	})
	return (
		<mesh
			ref={ref}
			// onAfterRender={() => {
			// 	H.snapshot(props.canvasRef.current)
			// }}
			{...props}
		>
			<cylinderGeometry args={[1.6, 1.6, 0.14, 128, 16, true]} />
			<meshSineMaterial
				map={texture}
				map-anisotropy={16}
				map-repeat={[30, 1]}
				side={THREE.DoubleSide}
				toneMapped={false}
			/>
		</mesh>
	)
}
