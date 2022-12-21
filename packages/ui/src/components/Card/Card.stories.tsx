import React from 'react'
import type { ComponentMeta } from '@storybook/react'

import { Card } from './Card'

export default {
	title: 'Components/Card',
	component: Card,
} as ComponentMeta<typeof Card>

export const Default = () => <Card>A Standard Card</Card>

export const Sizes = () => (
	<>
		<Card size="small">Card w/ Small Padding</Card>
		<br />
		<Card size="medium">Card w/ Medium Padding</Card>
		<br />
		<Card size="large">Card w/ Large Padding</Card>
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

		<Card border="secondary">
			A <code>neutral</code> Border
		</Card>

		<br />

		<Card border="none">No Border</Card>

		<br />

		<Card rounded={false}>No Rounded Corners</Card>
	</>
)
