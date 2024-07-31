import { Meta } from '@storybook/react'
import { useState } from 'react'

import { Text } from '../Text/Text'
import { Select } from './Select'

export default {
	title: 'Components/Select',
	component: Select,
} as Meta<typeof Select>

const OPTIONS = [
	'Jay',
	'Vadim',
	'Julian',
	'Zane',
	'Spenny',
	'Esplin',
	'Mike',
	'Chris',
]

export const Basic = () => {
	return (
		<Select defaultValue="Jay">
			<Options />
		</Select>
	)
}

export const MultiSelect = () => {
	return (
		<Select defaultValue={['Jay', 'Vadim']}>
			<Options />
		</Select>
	)
}

export const MultiSelectTags = () => {
	return (
		<Select defaultValue={['Jay', 'Vadim']} displayMode="tags">
			<Options />
		</Select>
	)
}

export const MultiSelectWithCheckbox = () => {
	return (
		<Select
			checkType="checkbox"
			defaultValue={['Jay', 'Vadim']}
			options={OPTIONS.map((option) => ({
				name: option,
				value: option,
			}))}
		/>
	)
}

export const Filterable = () => {
	return (
		<Select
			defaultValue={['Jay']}
			filterable
			options={OPTIONS.map((option) => ({
				name: option,
				value: option,
			}))}
		/>
	)
}

export const FilterableMultiSelectWithCheckboxes = () => {
	const [value, setValue] = useState(['Jay', 'Vadim'])
	const options = OPTIONS.map((option) => ({
		name: option,
		value: option,
	}))

	return (
		<Select
			options={options}
			checkType="checkbox"
			value={value}
			onChange={(newValue) => setValue(newValue)}
			renderValue={(values) => (
				<Text color="secondaryContentText">
					{Number(values.length)} selected
				</Text>
			)}
		/>
	)
}

type User = {
	name: string
	value: number
}
const users: User[] = OPTIONS.map((name, i) => ({
	name,
	value: i + 1,
}))
export const SelectWithObjectValuesAndTypes = () => {
	return <Select<User> value={users[0]} options={users} />
}

const Options = () => (
	<>
		{OPTIONS.map((option) => (
			<Select.Option key={option}>{option}</Select.Option>
		))}
	</>
)
