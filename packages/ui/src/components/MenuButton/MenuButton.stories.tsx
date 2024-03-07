import { Meta } from '@storybook/react'

import { MenuButton } from '../MenuButton/MenuButton'

export default {
	title: 'Components/MenuButton',
	component: MenuButton,
} as Meta<typeof MenuButton>

export const Basic = () => (
	<MenuButton
		options={[{ key: 'Hello!', render: 'Hello!' }]}
		onChange={(v) => {
			console.log(v)
		}}
	/>
)
