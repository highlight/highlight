import * as Ariakit from '@ariakit/react'
import { Meta } from '@storybook/react'
import { useState } from 'react'

import { Button } from '../Button/Button'
import { Select } from './Select'

export default {
	title: 'Components/Select',
	component: Select,
} as Meta<typeof Select>

export const Basic = () => {
	const [value, setValue] = useState<Ariakit.SelectStoreState['value']>('1')

	return (
		<Select value={value} setValue={setValue}>
			<Select.Trigger render={<Button />}>
				Selected value: {value}
			</Select.Trigger>
			<Select.Popover sameWidth>
				<Select.Item>1</Select.Item>
				<Select.Item>2</Select.Item>
				<Select.Item>3</Select.Item>
			</Select.Popover>
		</Select>
	)
}
