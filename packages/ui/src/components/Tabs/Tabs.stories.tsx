import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Tabs } from './Tabs'

export default {
	title: 'Components/Tabs',
	component: Tabs,
} as ComponentMeta<typeof Tabs>

export const Basic = () => (
	<Tabs
		pages={{
			hello: { page: <div>Hi</div> },
			there: { page: <div>there!</div> },
			world: { page: <div>Hello! 👋</div> },
		}}
	/>
)
