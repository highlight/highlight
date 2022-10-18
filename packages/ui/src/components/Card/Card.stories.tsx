import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Card } from './Card'

export default {
	title: 'Card',
	component: Card,
} as ComponentMeta<typeof Card>

export const Padding = () => <Card padding="medium">Card w/ Padding</Card>
