import * as Ariakit from '@ariakit/react'
import { Meta } from '@storybook/react'

import { Badge } from '../Badge/Badge'
import { IconSolidX } from '../icons'
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
		<Select
			defaultValue={['Jay', 'Vadim']}
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
	return <Select checkbox options={OPTIONS} />
}

// export const Filterable = () => {
// 	return <Select options={OPTIONS} />
// }

// export const FilterableMultiSelectWithCheckboxes = () => {
// 	const [value, setValue] = useState(['Jay', 'Vadim'])

// 	return (
// 		<Select
// 			options={OPTIONS}
// 			checkbox
// 			value={value}
// 			setValue={(newValue) => setValue(newValue)}
// 			renderValue={(values) => {
// 				return <>{Number(values.length)} selected</>
// 			}}
// 		/>
// 	)
// }

// type User = {
// 	name: string
// 	value: number
// }
// const users: User[] = OPTIONS.map((name, i) => ({
// 	name,
// 	value: i + 1,
// }))
// export const SelectWithObjectValues = () => {
// 	return <Select value={users[0]} options={users} />
// }

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
