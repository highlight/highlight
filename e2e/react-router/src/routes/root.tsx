import { H } from 'highlight.run'

H.init('1', {
	// Get your project ID from https://app.highlight.io/setup
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
})

export default function Root() {
	return (
		<div id="sidebar">
			<h1>Hello, world</h1>
		</div>
	)
}
