import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Callout } from './Callout'
import { Text } from '../Text/Text'
import { Box } from '../Box/Box'
import { Button } from '../Button/Button'

export default {
	title: 'Components/Callout',
	component: Callout,
} as ComponentMeta<typeof Callout>

export const Basic = () => (
	<Callout title="Only see one app version?" kind="warning">
		<Box gap="16" display="flex" flexDirection="column">
			<Text>
				Are there sourcemaps tied to your javascript code? If yes, you
				can upload them to Highlight in CI/CD to get enhanced stack
				traces.
			</Text>

			<Box display="flex" gap="8">
				<Button kind="primary">Sourcemap settings</Button>
				<Button kind="secondary">Learn more</Button>
			</Box>
		</Box>
	</Callout>
)
