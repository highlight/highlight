import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Form } from './Form'

export default {
	title: 'Components/Form',
	component: Form,
} as ComponentMeta<typeof Form>

export const Basic = () => <Form />
