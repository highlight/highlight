import { Meta } from '@storybook/react'
import { useState } from 'react'

import { Box } from '../Box/Box'
import { Text } from '../Text/Text'
import { TagSwitchGroup } from './TagSwitchGroup'

export default {
	title: 'Components/TagSwitchGroup',
	component: TagSwitchGroup,
} as Meta<typeof TagSwitchGroup>

export const Basic = () => {
	const options = ['Option 1', 'Option 2', 'Option 3']
	const [value, setValue] = useState<string | number>(options[0])

	return (
		<Box mx="auto" style={{ maxWidth: 400 }}>
			<Box>
				<TagSwitchGroup
					options={options}
					onChange={(newValue) => {
						setValue(newValue)
					}}
				/>

				<Box pt="32">
					<Text>
						Selected value: <b>{value}</b>
					</Text>
				</Box>
			</Box>
		</Box>
	)
}

export const NoBackground = () => {
	return (
		<Box mx="auto" style={{ maxWidth: 400 }}>
			<TagSwitchGroup options={[1, 2, 3, 4, 5]} background={false} />
		</Box>
	)
}
