import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { MenuButton } from '../MenuButton/MenuButton'

export default {
	title: 'Components/MenuButton',
	component: MenuButton,
} as ComponentMeta<typeof MenuButton>

export const Basic = () => (
	<MenuButton
		options={[
			{ key: '200', render: '200' },
			{ key: '300', render: '300' },
			{ key: '400', render: '400' },
		]}
		onChange={(v) => {
			alert(JSON.stringify(v))
		}}
	/>
)
