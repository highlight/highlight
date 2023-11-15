import { registerMicroApps, start } from 'qiankun'
import React from 'react'

export const Grafana = () => {
	registerMicroApps([
		{
			name: 'grafana', // app name registered
			entry: 'https://localhost:3005',
			container: '#grafana',
			activeRule: '/1/grafana',
			loader: () => {},
			props: {},
		},
	])

	start({})
	return (
		<>
			<div id="grafana" style={{ width: 100, height: 100 }} />
			<iframe
				style={{ width: 100, height: 100 }}
				src="https://grafana.highlight.io"
			></iframe>
		</>
	)
}
