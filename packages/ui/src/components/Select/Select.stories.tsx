import { Meta } from '@storybook/react'
import { useMemo, useState } from 'react'

import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'
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
			defaultValue={'Jay'}
			filterable
			options={OPTIONS.map((option) => ({
				name: option,
				value: option,
			}))}
		/>
	)
}

const DEFAULT_VALUE = ['Jay', 'Vadim']
export const FilterableMultiSelectWithCheckboxes = () => {
	const [value, setValue] = useState(DEFAULT_VALUE)
	const options = useMemo(
		() =>
			OPTIONS.map((option) => ({
				name: option,
				value: option,
			})),
		[],
	)

	return (
		<Stack gap="10" style={{ width: 250 }}>
			<Select
				filterable
				options={options}
				checkType="checkbox"
				value={value}
				onChange={(newValue: string[]) => {
					setValue(newValue)
				}}
				renderValue={(values) => (
					<Text color="secondaryContentText">
						{Number(values.length)} selected
					</Text>
				)}
			/>

			<Button onClick={() => setValue(DEFAULT_VALUE)}>Reset</Button>
		</Stack>
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
	return <Select<User> defaultValue={users[0]} options={users} />
}

const Options = () => (
	<>
		{OPTIONS.map((option) => (
			<Select.Option key={option}>{option}</Select.Option>
		))}
	</>
)