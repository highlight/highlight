'use client'

import type { EngineOptions, SceneOptions } from 'babylonjs'
import {
	ArcRotateCamera,
	Color3,
	Engine,
	HemisphericLight,
	MeshBuilder,
	PBRMaterial,
	Scene,
	ScenePerformancePriority,
	Vector3,
} from 'babylonjs'
import { useEffect, useRef, useState } from 'react'

import { H } from '@highlight-run/next/client'

export const Canvas = ({
	antialias,
	engineOptions,
	adaptToDeviceRatio,
	sceneOptions,
	...rest
}: {
	antialias?: boolean
	engineOptions?: EngineOptions
	adaptToDeviceRatio?: boolean
	sceneOptions?: SceneOptions
}) => {
	const reactCanvas = useRef(null)
	const loadTimer = useRef<number>()
	const load = useRef<() => void>()

	const [loaded, setLoaded] = useState(false)
	const [canvas, setCanvas] = useState<{
		engine: Engine | null
		scene: Scene | null
	}>({ engine: null, scene: null })

	const onRender = (scene: Scene) => {
		// console.debug('onRender', scene)
		if (reactCanvas.current) {
			H.snapshot(reactCanvas.current)
		}
	}
	const onSceneReady = (scene: Scene) => {
		console.debug('onSceneReady', scene)
	}

	useEffect(() => {
		H.identify('vadim@highlight.io')
	}, [])

	useEffect(() => {
		if (typeof window === 'object') {
			const resize = () => {
				if (canvas.scene) {
					canvas.scene.getEngine().resize()
				}
			}
			window.addEventListener('resize', resize)

			return () => {
				window.removeEventListener('resize', resize)
			}
		}
	}, [canvas])

	useEffect(() => {
		load.current = () => {
			setLoaded(true)
			const engine = new Engine(
				reactCanvas.current,
				antialias,
				engineOptions,
				adaptToDeviceRatio,
			)
			const createScene = function () {
				// Creates a basic Babylon Scene object
				const scene = new Scene(engine, sceneOptions)
				scene.performancePriority = ScenePerformancePriority.Aggressive
				const camera = new ArcRotateCamera(
					'camera1',
					Math.PI / 2,
					Math.PI / 2,
					80,
					new Vector3(0, 0, 0),
					scene,
				)
				camera.attachControl(reactCanvas.current, true)

				// Creates a light, aiming 0,1,0 - to the sky
				const light = new HemisphericLight(
					'light',
					new Vector3(0, 1, 0),
					scene,
				)
				// Dim the light a small amount - 0 to 1
				light.intensity = 0.7

				// create a bunch of spheres
				let sphereCount = 2500
				let materialCount = 50
				let materials = []

				for (let index = 0; index < materialCount; index++) {
					let pbr = new PBRMaterial('mat ' + index, scene)
					pbr.emissiveColor = new Color3(
						Math.random(),
						Math.random(),
						Math.random(),
					)
					materials.push(pbr)
				}

				for (let index = 0; index < sphereCount; index++) {
					let sphere = MeshBuilder.CreateSphere(
						'sphere',
						{ diameter: 2, segments: 32 },
						scene,
					)
					sphere.position = new Vector3(
						20 - Math.random() * 40,
						20 - Math.random() * 40,
						20 - Math.random() * 40,
					)
					sphere.material = materials[index % materialCount]
				}

				// Create some random hierarchy
				const levelMax = 5
				let level = 0
				for (let index = 0; index < sphereCount; index++) {
					if (level !== 0) {
						let sphere = scene.meshes[index]
						sphere.setParent(scene.meshes[index - 1])
					}
					level++

					if (level >= levelMax) {
						level = 0
					}
				}

				scene.createDefaultEnvironment()

				return scene
			}
			const scene = createScene()
			setCanvas({ scene, engine })
			if (scene.isReady()) {
				onSceneReady(scene)
			} else {
				scene.onReadyObservable.addOnce((scene) => onSceneReady(scene))
			}
			scene.onBeforeRenderObservable.add(() => {
				for (let index = 0; index < scene.meshes.length; index++) {
					const sphere = scene.meshes[index]
					sphere.rotation.y += 0.01
				}
			})

			engine.runRenderLoop(() => {
				scene.render()
				if (typeof onRender === 'function') {
					onRender(scene)
				}
			})

			loadTimer.current = undefined
		}

		return () => {
			if (loadTimer.current) {
				window.clearTimeout(loadTimer.current)
				loadTimer.current = undefined
			}
			if (canvas.scene !== null) {
				canvas.scene.dispose()
			}
			setLoaded(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reactCanvas])

	return (
		<div>
			<button
				onClick={() => {
					H.track('loading canvas')
					if (load.current) {
						loadTimer.current = window.setTimeout(
							load.current,
							1000,
						)
					}
				}}
			>
				init
			</button>
			<button
				onClick={() => {
					H.track('render loop start')
					canvas.engine?.runRenderLoop(() => {
						onRender(canvas.scene!)
						canvas.scene!.render()
					})
				}}
			>
				start
			</button>
			<button
				onClick={() => {
					H.track('render loop stop')
					canvas.engine?.stopRenderLoop()
				}}
			>
				stop
			</button>
			<canvas
				style={{ width: '100%', height: '100%' }}
				ref={reactCanvas}
				{...rest}
			/>
		</div>
	)
}
