import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { DropdownButton } from '@components'

export default {
	title: 'Components/DropdownButton',
	component: DropdownButton,
} as ComponentMeta<typeof DropdownButton>

export const Basic = () => (
	<DropdownButton
		options={['Hello!']}
		onChange={(v) => {
			console.log(v)
		}}
	/>
)
