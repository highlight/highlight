import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Heading } from './Heading'

export default {
	title: 'Components/Heading',
	component: Heading,
} as ComponentMeta<typeof Heading>

export const Sizes = () => (
	<>
		<Heading size="h1">Heading 1</Heading>
		<br />
		<Heading size="h2">Heading 2</Heading>
		<br />
		<Heading size="h3">Heading 3</Heading>
		<br />
		<Heading size="h4">Heading 4</Heading>
	</>
)
