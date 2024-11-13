import { useState } from 'hono/jsx'
import { render, type PropsWithChildren } from 'hono/jsx/dom'

export const Layout = ({
	children,
	traceId,
	parentSpanId,
}: PropsWithChildren<{ traceId: string; parentSpanId: string }>) => {
	return (
		<html>
			<head>
				<title>Hono API Tester</title>
				<meta
					name="traceparent"
					content={`00-${traceId}-${parentSpanId}-01`}
				/>
				{import.meta.env.PROD ? (
					<script type="module" src="/static/client.js"></script>
				) : (
					<script type="module" src="/src/client.tsx"></script>
				)}
			</head>
			<body>
				<div
					style={{
						fontFamily: 'Arial, sans-serif',
						maxWidth: '800px',
						margin: '2rem auto',
						padding: '0 1rem',
					}}
				>
					{children}
				</div>
			</body>
		</html>
	)
}

const App = () => {
	const [result, setResult] = useState<any>(null)
	const [error, setError] = useState<string | null>(null)

	const makeRequest = async (endpoint: string) => {
		try {
			const response = await fetch(endpoint)
			const data = await response.json()
			setResult(data)
			setError(null)
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError('An unknown error occurred')
			}
			setResult(null)
		}
	}

	return (
		<Layout>
			<h1>Hono API Tester</h1>
			<div>
				<button
					onClick={() => makeRequest('/api/hello')}
					style={{
						marginRight: '0.5rem',
						padding: '0.5rem 1rem',
						cursor: 'pointer',
					}}
				>
					Test Hello Endpoint
				</button>
				<button
					onClick={() => makeRequest('/api/error')}
					style={{
						marginRight: '0.5rem',
						padding: '0.5rem 1rem',
						cursor: 'pointer',
					}}
				>
					Test Error Endpoint
				</button>
			</div>

			<div
				style={{
					marginTop: '1rem',
					padding: '1rem',
					border: '1px solid #ccc',
					borderRadius: '4px',
					minHeight: '100px',
				}}
			>
				{error ? (
					<pre style={{ color: 'red' }}>Error: {error}</pre>
				) : result ? (
					<pre>{JSON.stringify(result, null, 2)}</pre>
				) : null}
			</div>
		</Layout>
	)
}

const root = document.getElementById('root')
render(<App />, root)
