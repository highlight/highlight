import { Meta } from '@storybook/react'
import { useEffect, useState } from 'react'

import { Box } from '../Box/Box'
import { Form } from '../Form/Form'

const meta = {
	title: 'Components/Form',
	component: Form,
} as Meta<typeof Form>

export default meta

const ISSUE_TYPES = ['Bug', 'Feature Request', 'Other']
const PRIORITIES = ['Low', 'Medium', 'High']

export const Basic = () => {
	const formStore = Form.useStore({
		defaultValues: {
			issueTitle: 'Test Issue',
			issueDescription: 'This is a test issue',
			issueType: ISSUE_TYPES[1],
			issueNumber: 10,
		},
	})
	const values = formStore.useState('values')
	const [priority, setPriority] = useState<(typeof PRIORITIES)[0]>()

	useEffect(() => {
		setTimeout(() => {
			// Simulate loading
			setPriority(PRIORITIES[1])
		}, 500)
	}, [])

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
						options={ISSUE_TYPES}
					/>
					<Form.Select
						name="priority"
						label="Priority"
						options={PRIORITIES}
						value={priority}
					/>
					<Form.Input
						type="number"
						name="issueNumber"
						label="Issue Number"
						step="5"
						defaultValue="10"
						min={0}
						max={500}
					/>
				</Box>
			</Form>

			<Box p="8" border="dividerWeak" borderRadius="6" overflow="scroll">
				<pre>{JSON.stringify(values, null, 2)}</pre>
			</Box>
		</Box>
	)
}
