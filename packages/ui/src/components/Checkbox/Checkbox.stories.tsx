import { Meta } from '@storybook/react'

import { Checkbox } from './Checkbox'
import { useState } from 'react'

export default {
	title: 'Components/Checkbox',
	component: Checkbox,
} as Meta<typeof Checkbox>

export const Basic = () => {
	const [checked, setChecked] = useState(false)
	return (
		<Checkbox
			label="Good evening! 👋"
			checked={checked}
			onChange={() => setChecked((prev) => !prev)}
		/>
	)
}
