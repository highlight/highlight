import React from 'react'
import { Meta } from '@storybook/react'

import { Tabs } from './Tabs'

export default {
	title: 'Components/Tabs',
	component: Tabs,
} as Meta<typeof Tabs>

export const Basic = () => (
	<Tabs
		pages={{
			hello: { page: <div>Hi</div> },
			there: { page: <div>there!</div> },
			world: { page: <div>Hello! 👋</div> },
		}}
	/>
)
