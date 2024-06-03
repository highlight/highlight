import { Meta } from '@storybook/react'

import { Box } from '../Box/Box'
import { Form } from '../Form/Form'

const meta = {
	title: 'Components/Form',
	component: Form,
} as Meta<typeof Form>

export default meta

export const Basic = () => {
	return (
		<Box style={{ width: 300 }}>
			<Form
				defaultValues={{
					issueTitle: 'Test Issue',
					issueDescription: 'This is a test issue',
				}}
			>
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

					<Form.Input
						type="number"
						name="issueNumber"
						label="Issue Number"
						step="5"
						defaultValue="10"
						min={0}
						max={50}
					/>
				</Box>
			</Form>
		</Box>
	)
}
