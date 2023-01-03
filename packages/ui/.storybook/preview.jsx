import React from 'react'
import { StoryWrapper } from '../src/docs/StoryWrapper'

export const decorators = [
	(Story) => (
		<StoryWrapper>
			<Story />
		</StoryWrapper>
	),
]

export const parameters = {
	actions: { argTypesRegex: '^on[A-Z].*' },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
	options: {
		storySort: {
			// controls the ordering of the left menu
			order: ['Guides', 'Foundations', 'Components'],
		},
	},
}
