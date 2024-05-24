import { Meta } from '@storybook/react'

import { Box } from '../Box/Box'
import { Form } from '../Form/Form'

const meta = {
	title: 'Components/Form',
	component: Form,
} as Meta<typeof Form>

export default meta

export const Basic = () => {
	const formStore = Form.useStore({
		defaultValues: {
			issueTitle: 'Test Issue',
			issueDescription: 'This is a test issue',
		},
	})
	const values = formStore.useState('values')

	return (
		<Box style={{ width: 500 }}>
			<Form store={formStore}>
				<Box gap="12" display="flex" flexDirection="column" mb="16">
					<Form.Input outline name="issueTitle" label="Issue Title" />
					<Form.Input
						name="issueDescription"
						label="Issue Description"
					/>
					<Form.Select
						name="issueType"
						label="Issue Type"
						defaultValue="2"
					>
						<Form.Option>1</Form.Option>
						<Form.Option>2</Form.Option>
						<Form.Option>3</Form.Option>
					</Form.Select>

					<Form.Input
						type="number"
						name="issueNumber"
						label="Issue Number"
					/>
				</Box>
			</Form>

			<Box p="8" border="dividerWeak" borderRadius="6" overflow="scroll">
				<pre>{JSON.stringify(values, null, 2)}</pre>
			</Box>
		</Box>
	)
}
