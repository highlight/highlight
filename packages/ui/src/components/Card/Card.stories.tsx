import type { Meta } from '@storybook/react'

import { Card } from './Card'

export default {
	title: 'Components/Card',
	component: Card,
} as Meta<typeof Card>

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
		<Card>A Light Mode Card (Default)</Card>

		<br />

		<Card>A Dark Mode Card</Card>
	</>
)

export const Borders = () => (
	<>
		<Card border="primary">
			A <code>primary</code> Border
		</Card>

		<br />

		<Card border="secondary">
			A <code>secondary</code> Border
		</Card>

		<br />

		<Card border="none">No Border</Card>

		<br />

		<Card rounded={false}>No Rounded Corners</Card>
	</>
)
