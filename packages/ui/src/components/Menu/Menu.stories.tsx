import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Menu } from './Menu'
import { TextLink } from '../TextLink/TextLink'

export default {
	title: 'Components/Menu',
	component: Menu,
} as ComponentMeta<typeof Menu>

// TODO: Document individual components
export const FullExample = () => (
	<Menu>
		<Menu.Button kind="secondary" emphasis="low">
			Menu
		</Menu.Button>
		<Menu.List>
			<Menu.Item onClick={() => alert('Edit')}>Edit</Menu.Item>
			<Menu.Item>
				<TextLink href="http://example.com" target="_blank">
					Go to website
				</TextLink>
			</Menu.Item>
			<Menu.Item disabled>Delete (disabled)</Menu.Item>
			<Menu.Divider />
			<Menu.Item>Report</Menu.Item>
		</Menu.List>
	</Menu>
)
