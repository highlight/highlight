import * as Ariakit from '@ariakit/react'
import { Meta } from '@storybook/react'
import { useState } from 'react'

import { Badge } from '../Badge/Badge'
import { IconSolidX } from '../icons'
import { FilterableSelect, Select } from './Select'

export default {
	title: 'Components/Select',
	component: Select,
} as Meta<typeof Select>

export const Basic = () => {
	const [value, setValue] = useState<Ariakit.SelectStoreState['value']>('Jay')

	return (
		<Select value={value} setValue={setValue}>
			<Options />
		</Select>
	)
}

export const MultiSelect = () => {
	const [value, setValue] = useState<Ariakit.SelectStoreState['value']>([
		'Jay',
		'Vadim',
	])

	return (
		<Select value={value} setValue={setValue}>
			<Options />
		</Select>
	)
}

export const MultiSelectTags = () => {
	const [value, setValue] = useState<Ariakit.SelectStoreState['value']>([
		'Jay',
		'Vadim',
	])

	return (
		<Select
			value={value}
			setValue={setValue}
			renderValue={(values) => {
				if (!values.length) {
					return 'None selected'
				}

				return (
					<>
						{(values as string[]).map((value) => (
							<SelectTag key={value}>{value}</SelectTag>
						))}
					</>
				)
			}}
		>
			<Options />
		</Select>
	)
}

export const MultiSelectWithCheckbox = () => {
	const [value, setValue] = useState<Ariakit.SelectStoreState['value']>([
		'Jay',
		'Vadim',
	])

	return (
		<Select value={value} setValue={setValue}>
			{OPTIONS.map((option) => (
				<Select.Option key={option} checkbox>
					{option}
				</Select.Option>
			))}
		</Select>
	)
}

export const Filterable = () => {
	return <FilterableSelect options={OPTIONS} />
}

export const FilterableMultiSelectWithCheckboxes = () => {
	const [value, setValue] = useState<Ariakit.SelectStoreState['value']>([
		'Jay',
		'Vadim',
	])

	return (
		<FilterableSelect
			options={OPTIONS}
			checkbox
			value={value}
			setValue={setValue}
			renderValue={(values) => {
				return <>{Number(values.length)} selected</>
			}}
		/>
	)
}

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
const Options = () => (
	<>
		{OPTIONS.map((option) => (
			<Select.Option key={option}>{option}</Select.Option>
		))}
	</>
)

const SelectTag: React.FC<{ children: string }> = ({ children }) => {
	const selectStore = Ariakit.useSelectContext()!
	const value = selectStore.useState('value')

	return (
		<Badge
			cursor="pointer"
			label={children}
			iconEnd={<IconSolidX />}
			onMouseDown={(e) => {
				e.preventDefault()
				e.stopPropagation()

				const newValue = (value as string[]).filter(
					(v) => v !== children,
				)
				selectStore.setValue(newValue)
			}}
		/>
	)
}
