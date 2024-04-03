import { Meta } from '@storybook/react'
import { useState } from 'react'

import { OldTabs } from './OldTabs'

export default {
	title: 'Components/OldTabs',
	component: OldTabs,
} as Meta<typeof OldTabs>

export const Basic = () => {
	const [tab, setTab] = useState('hello')

	return (
		<OldTabs
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
