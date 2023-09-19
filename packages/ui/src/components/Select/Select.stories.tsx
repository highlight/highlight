import { Meta } from '@storybook/react'

import { Select } from './Select'
import { Box } from '../Box/Box'

export default {
	title: 'Components/Select',
	component: Select,
} as Meta<typeof Select>

export const Basic = () => {
	return (
		<Select label={<Select.Label>Name</Select.Label>}>
			<Select.Option value="Spenny">Spenny</Select.Option>
			<Select.Option value="Chris">Chris</Select.Option>
			<Select.Option value="Jay">Jay</Select.Option>
		</Select>
	)
}

export const WithForm = () => {
	return <Box>TODO: See https://ariakit.org/examples/form-select</Box>
}
