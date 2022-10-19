import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import { Card } from './Card'

export default {
	title: 'Card',
	component: Card,
} as ComponentMeta<typeof Card>

export const Padding: ComponentStory<typeof Card> = () => (
	<Card padding="xxLarge">Card w/ Padding</Card>
)
export const Border = () => (
	<>
		<Card
			border="neutral"
			borderRadius="large"
			color="purple100"
			padding="medium"
		>
			Card w/ Padding + Border
		</Card>

		<br />

		<Card
			background="neutral50"
			border="neutralLarge"
			color="purple100"
			padding="medium"
		>
			Card w/ Padding + Border
		</Card>
	</>
)
