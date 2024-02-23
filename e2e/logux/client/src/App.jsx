import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { useDispatch } from '@logux/redux'
import { store } from './store'
import { H } from 'highlight.run'
import './App.css'

H.init('3', {
	backendUrl: 'https://localhost:8082/public',
	serviceName: 'logux-client',
	tracingOrigins: ['localhost:5173', 'localhost:31337'],
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
})

function App() {
	const { sync } = useDispatch()
	const state = store.getState()
	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank" rel="noreferrer">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank" rel="noreferrer">
					<img
						src={reactLogo}
						className="logo react"
						alt="React logo"
					/>
				</a>
			</div>
			<h1>Vite + React</h1>
			<h3>Value {state.counter}</h3>
			<div className="card">
				<button
					onClick={() =>
						sync({ type: 'INCREMENT', name }).then((meta) => {
							console.log('meta', { meta })
						})
					}
				>
					increment
				</button>
				<button
					onClick={() =>
						sync({ type: 'DECREMENT', name }).then((meta) => {
							console.log('meta', { meta })
						})
					}
				>
					decrement
				</button>
				<p>
					Edit <code>src/App.jsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</>
	)
}

export default App
