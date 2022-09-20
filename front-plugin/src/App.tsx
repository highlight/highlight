import './App.css'
import HighlightSessions from './components/HighlightSessions'
import { useFrontContext } from './providers/frontContext'
import { useEffect } from 'react'
import { H } from 'highlight.run'
import OAuth from './components/OAuth'

function App() {
	const context = useFrontContext()

	useEffect(() => {
		if (context?.teammate) {
			H.identify(context?.teammate.email, context?.teammate as any)
		}
	}, [context])

	if (!context)
		return (
			<div className="App">
				<p>Waiting to connect to the Front context.</p>
			</div>
		)

	switch (context.type) {
		case 'noConversation':
			return (
				<div className="App">
					<p>
						No conversation selected. Select a conversation to use
						this plugin.
					</p>
				</div>
			)
		case 'singleConversation':
			return (
				<div className="App">
					<HighlightSessions />
					<OAuth />
				</div>
			)
		case 'multiConversations':
			return (
				<div className="App">
					<p>
						Multiple conversations selected. Select only one
						conversation to use this plugin.
					</p>
				</div>
			)
		default:
			console.error(`Unsupported context type: ${context.type}`)
			break
	}
	return null
}

export default App
