import { Meta } from '@storybook/react'
import { useState } from 'react'

import { ComboboxSelect } from './ComboboxSelect'

export default {
	title: 'Components/ComboboxSelect',
	component: ComboboxSelect,
} as Meta<typeof ComboboxSelect>

const OPTIONS = ['apple', 'bananas', 'mango', 'pear']

export const Basic = () => {
	const [value, setValue] = useState('')
	const options = OPTIONS.map((option) => ({
		key: option,
		render: option,
	}))

	return (
		<ComboboxSelect
			label="Fruits"
			onChange={setValue}
			valueRender={value || 'Select fruit'}
			value={value}
			options={options}
			queryPlaceholder="Search fruit..."
		/>
	)
}

export const Creatable = () => {
	const [value, setValue] = useState('')
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setQuery] = useState('')
	const options = OPTIONS.map((option) => ({
		key: option,
		render: option,
	}))

	return (
		<ComboboxSelect
			label="Fruits"
			onChange={setValue}
			valueRender={value || 'Select fruit'}
			value={value}
			options={options}
			queryPlaceholder="Search fruit..."
			onChangeQuery={setQuery}
			creatableRender={(key) => key}
		/>
	)
}

export const MultiSelect = () => {
	const [values, setValues] = useState<string[]>([])
	// eslint-disable-next-line @typescript-eslint/no-unused-vars

	const options = OPTIONS.map((option) => ({
		key: option,
		render: option,
	}))

	return (
		<ComboboxSelect
			label="Fruits"
			onChange={setValues}
			valueRender="Find..."
			value={values}
			options={options}
		/>
	)
}

export const CreateableMultiSelect = () => {
	const [values, setValues] = useState<string[]>([])
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setQuery] = useState('')

	const options = OPTIONS.map((option) => ({
		key: option,
		render: option,
	}))

	return (
		<ComboboxSelect
			label="Fruits"
			onChange={setValues}
			valueRender="Find..."
			value={values}
			options={options}
			queryPlaceholder="Search fruit..."
			onChangeQuery={setQuery}
			creatableRender={(key) => key}
		/>
	)
}
