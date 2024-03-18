import { Meta } from '@storybook/react'
import { useState } from 'react'

import { Tabs } from './Tabs'

export default {
	title: 'Components/Tabs',
	component: Tabs,
} as Meta<typeof Tabs>

export const Basic = () => {
	const [tab, setTab] = useState('hello')

	return (
		<Tabs
			tab={tab}
			setTab={setTab}
			pages={{
				hello: { page: <div>Hi</div> },
				there: { page: <div>there!</div> },
				world: { page: <div>Hello! 👋</div> },
			}}
		/>
	)
}
