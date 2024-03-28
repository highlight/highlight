import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Perf, setCustomData } from 'r3f-perf'
import { H } from 'highlight.run'

// Interval hook
function useInterval(callback, delay) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

// View Component
const CanvasSnaphsotter = () => {
  const [delay, setDelay] = useState(2000) // Increased throttle interval
  const [isInteracted, setIsInteracted] = useState(false)
  const lastSampleTime = useRef(-Infinity)

  const captureSnapShot = ({ gl, scene, camera }) => {
    gl.render(scene, camera)
    if (isInteracted) {
      const time = performance.now()
      if (time - lastSampleTime.current > delay) {
        console.log('SAMPLE DURATION', performance.now() - time + 'ms')
        lastSampleTime.current = performance.now()
      }
      setIsInteracted(false) // reset the flag
    }
  }

  useFrame(captureSnapShot, 1)

  useInterval(() => {
    // You can replace this with a condition when and only
    // when a certain interaction has happened/certain condition holds
    setIsInteracted(true)
  }, delay)

  return null
}

function Box(props) {
  const ref = useRef()
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  useEffect(() => {
    ref.current.rotation.x = Math.random() * Math.PI
  }, [])
  useFrame((state, delta) => (ref.current.rotation.x += delta))
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => (event.stopPropagation(), hover(true))}
      onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

export default function App() {
  const [boxes] = useState(() => {
    return Array.from({ length: 1500 }).map((_, index) => (
      <Box key={index} position={[-2 + Math.random() * 4, -2 + Math.random() * 4, -1 + Math.random() * 2]} />
    ))
  })

  return (
    <Canvas>
      <CanvasSnaphsotter />
      <Perf
        customData={{
          name: 'Snapshot',
          info: 'ms'
        }}
      />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      {boxes}
      <OrbitControls />
    </Canvas>
  )
}
