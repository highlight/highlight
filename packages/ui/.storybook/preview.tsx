import type { Preview, StoryFn } from '@storybook/react'
import React from 'react'

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
		options: {
			storySort: {
				order: ['Guides', 'Components'],
			},
		},
	},
	decorators: [
		(Story: StoryFn) => (
			<StoryWrapper>
				<Story />
			</StoryWrapper>
		),
	],
}

const StoryWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
	React.useEffect(() => {
		// Applying theme class via JS to the body so it applies to portals rendered
		// outside the main DOM tree.
		document.body.classList.add('highlight-light-theme')
	}, [])

	return <>{children}</>
}

export default preview
