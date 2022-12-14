import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { MenuButton } from '@components'

export default {
	title: 'Components/MenuButton',
	component: MenuButton,
} as ComponentMeta<typeof MenuButton>

export const Basic = () => (
	<MenuButton
		options={[{ key: 'Hello!', render: 'Hello!' }]}
		onChange={(v) => {
			console.log(v)
		}}
	/>
)
