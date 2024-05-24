import { Meta } from '@storybook/react'

import { MultiSelectButton } from './MultiSelectButton'

export default {
	title: 'Components/MultiSelectButton',
	component: MultiSelectButton,
} as Meta<typeof MultiSelectButton>

const OPTIONS = [
	{ key: 'Apple', render: <div>Apple</div> },
	{ key: 'Mango', render: <div>Mango</div> },
	{ key: 'Pear', render: <div>Pear</div> },
	{ key: 'Grape', render: <div>Grape</div> },
	{ key: 'Grapefruit', render: <div>Grapefruit</div> },
	{ key: 'Lemon', render: <div>Lemon</div> },
]

export const FullExample = () => (
	<MultiSelectButton
		label="Fruits"
		defaultValue="Mango"
		options={OPTIONS}
		onChange={(values) => console.log(values.join('/'))}
		value={[]}
		selected={false}
	/>
)
