import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Callout, Props as CalloutProps } from './Callout'
import { Text } from '../Text/Text'
import { Box } from '../Box/Box'
import { Button } from '../Button/Button'

export default {
	title: 'Components/Callout',
	component: Callout,
} as ComponentMeta<typeof Callout>

const Content: React.FC<{
	kind: CalloutProps['kind']
	icon?: CalloutProps['icon']
}> = ({ kind, icon }) => {
	return (
		<Callout title="Only see one app version?" kind={kind} icon={icon}>
			<Box gap="16" display="flex" flexDirection="column">
				<Text>
					Are there sourcemaps tied to your javascript code? If yes,
					you can upload them to Highlight in CI/CD to get enhanced
					stack traces.
				</Text>

				<Box display="flex" gap="8">
					<Button kind="primary">Sourcemap settings</Button>
					<Button kind="secondary">Learn more</Button>
				</Box>
			</Box>
		</Callout>
	)
}

export const Basic = () => (
	<>
		<Content kind="info" />
		<Content kind="warning" />
		<Content kind="error" />
		<Content kind="info" icon={false} />
	</>
)
