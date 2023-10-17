import { Meta } from '@storybook/react'

import { Box } from '../Box/Box'
import { Form, useFormStore } from '../Form/Form'

const meta = {
	title: 'Components/Form',
	component: Form,
} as Meta<typeof Form>

export default meta

export const Basic = () => {
	const formStore = useFormStore({
		defaultValues: {
			issueTitle: 'Test Issue',
			issueDescription: 'This is a test issue',
		},
	})
	return (
		<Box style={{ width: 300 }}>
			<Form store={formStore}>
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
