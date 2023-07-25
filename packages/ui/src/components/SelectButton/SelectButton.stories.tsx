import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { SelectButton } from './SelectButton'

export default {
	title: 'Components/MultiSelectButton',
	component: SelectButton,
} as ComponentMeta<typeof SelectButton>

const OPTIONS = [
	{ key: 'Apple', render: <div>Apple</div> },
	{ key: 'Mango', render: <div>Mango</div> },
	{ key: 'Pear', render: <div>Pear</div> },
	{ key: 'Grape', render: <div>Grape</div> },
	{ key: 'Grapefruit', render: <div>Grapefruit</div> },
	{ key: 'Lemon', render: <div>Lemon</div> },
]

export const FullExample = () => (
	<SelectButton
		label="Fruits"
		defaultValue="Mango"
		options={OPTIONS}
		onChange={(values) => console.log(values.join('/'))}
	/>
)
