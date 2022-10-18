import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Card } from './Card'

export default {
	title: 'Card',
	component: Card,
} as ComponentMeta<typeof Card>

export const Padding = () => <Card padding="xxLarge">Card w/ Padding</Card>
export const Border = () => (
	<>
		<Card
			background="neutral50"
			border="black"
			borderRadius="large"
			color="purple100"
			padding="medium"
		>
			Card w/ Padding + Border
		</Card>

		<Card
			background="neutral50"
			borderLeft="neutral"
			color="purple100"
			padding="medium"
		>
			Card w/ Padding + Border
		</Card>
	</>
)
