import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Card } from './Card'

export default {
	title: 'Card',
	component: Card,
} as ComponentMeta<typeof Card>

export const Default = () => <Card>A Standard Card</Card>

export const Sizes = () => (
	<>
		<Card size="small">Card w/ Padding</Card>
		<br />
		<Card size="medium">Card w/ Padding</Card>
		<br />
		<Card size="large">Card w/ Padding</Card>
	</>
)

export const Modes = () => (
	<>
		<Card mode="light">A Light Mode Card (Default)</Card>

		<br />

		<Card mode="dark">A Dark Mode Card</Card>
	</>
)

export const Borders = () => (
	<>
		<Card border="black">
			A <code>black</code> Border
		</Card>

		<br />

		<Card border="purple">
			A <code>purple</code> Border
		</Card>

		<br />

		<Card border="neutral">
			A <code>neutral</code> Border
		</Card>

		<br />

		<Card border="none">No Border</Card>

		<br />

		<Card rounded={false}>No Rounded Corners</Card>
	</>
)
