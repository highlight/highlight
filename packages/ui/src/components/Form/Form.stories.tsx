import React from 'react'
import { ComponentMeta } from '@storybook/react'

import { Form, useFormState } from './Form'
import { Box } from '../Box/Box'

export default {
	title: 'Components/Form',
	component: Form,
} as ComponentMeta<typeof Form>

export const Basic = () => {
	const form = useFormState({
		defaultValues: {
			issueTitle: 'Test Issue',
			issueDescription: 'This is a test issue',
		},
	})
	return (
		<Box style={{ width: 300 }}>
			<Form state={form}>
				<Box
					px="12"
					py="8"
					gap="12"
					display="flex"
					flexDirection="column"
				>
					<Form.Input outline name="issueTitle" label="Issue Title" />
					<Form.Input
						name="issueDescription"
						label="Issue Description"
					/>
				</Box>
			</Form>
		</Box>
	)
}
