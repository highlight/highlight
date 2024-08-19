import { Meta } from '@storybook/react'
import { useState } from 'react'

import { Box } from '../Box/Box'
import { Button } from '../Button/Button'
import {
	IconSolidArrowsExpand,
	IconSolidLightningBolt,
	IconSolidTraces,
} from '../icons'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import { Select } from './Select'

export default {
	title: 'Components/Select',
	component: Select,
	decorators: [
		(Story) => (
			<Box style={{ width: 300 }}>
				<Story />
			</Box>
		),
	],
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
		<Select defaultValue={['jay', 'vadim']} displayMode="tags">
			<Select.Option value="jay">Jay Khatri</Select.Option>
			<Select.Option value="vadim">Vadim Korolik</Select.Option>
			<Select.Option value="spenny">Spencer Amarantides</Select.Option>
			<Select.Option value="julian">Julian Schneider</Select.Option>
			<Select.Option value="zane">Zane Mayberry</Select.Option>
			<Select.Option value="mike">Michael Overhulse</Select.Option>
			<Select.Option value="chris">Chris Schmitz</Select.Option>
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

export const Creatable = () => {
	return (
		<Stack gap="20">
			<Select
				filterable
				onCreate={(value) => alert(value)}
				defaultValue={'Jay'}
				options={OPTIONS}
			/>

			<Select
				creatable
				filterable
				defaultValue={['Jay', 'Vadim']}
				options={OPTIONS}
			/>
		</Stack>
	)
}

const DEFAULT_VALUE = ['Jay', 'Vadim']
export const FilterableMultiSelectWithCheckboxes = () => {
	const [value, setValue] = useState(DEFAULT_VALUE)

	return (
		<Stack gap="10">
			<Select
				filterable
				options={OPTIONS}
				checkType="checkbox"
				value={value}
				onValueChange={(newValue: string[]) => {
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
export const DynamicOptionsAndCustomTypes = () => {
	const [options, setOptions] = useState<User[]>(users)
	const [value, setValue] = useState<User[]>([])

	return (
		<Stack gap="10">
			<pre style={{ whiteSpace: 'pre-wrap' }}>
				{JSON.stringify(options)}
			</pre>

			<Select<User[]>
				value={value}
				options={options}
				placeholder="Select a user..."
				onValueChange={(newValue) => {
					setValue(newValue)
				}}
			/>

			<Button
				onClick={() => {
					const number = options.length + 1
					setOptions((prev) => [
						...prev,
						{ name: `New User ${number}`, value: number },
					])
				}}
			>
				Add Option
			</Button>
		</Stack>
	)
}

export const CustomValuesWithOptions = () => {
	const [value, setValue] = useState(['Simone', 'Jay', 'Suni'])

	return (
		<Stack gap="10">
			<Text>
				Reconciles when the selected values do not exist within the
				options passed to the component.
			</Text>

			<Select value={value} options={OPTIONS} onValueChange={setValue} />
		</Stack>
	)
}

export const Disabled = () => {
	const [enabled, setEnabled] = useState(false)
	return (
		<Stack>
			<Select options={OPTIONS} disabled={!enabled} />
			<Button onClick={() => setEnabled(!enabled)}>
				{enabled ? 'Disable' : 'Enable'}
			</Button>
		</Stack>
	)
}

const METRIC_TYPES = [
	{
		name: 'Traces',
		value: 'traces',
		icon: <IconSolidTraces />,
	},
	{
		name: 'Errors',
		value: 'errors',
		icon: <IconSolidLightningBolt />,
	},
] as const
export const ClearableWithCustomValueAndOptionRendering = () => {
	return (
		<Select
			clearable
			defaultValue={METRIC_TYPES[0]}
			renderValue={(value) => {
				const metrics = METRIC_TYPES.filter((m) =>
					value.includes(m.value),
				)

				if (!metrics.length) {
					return <>Select...</>
				}

				return (
					<>
						{metrics.map((metric) => (
							<Text
								key={metric.value}
								color="secondaryContentOnEnabled"
							>
								<Stack direction="row" gap="6" align="center">
									{metric.icon}
									{metric.value}
								</Stack>
							</Text>
						))}
					</>
				)
			}}
		>
			{METRIC_TYPES.map((metric) => (
				<Select.Option key={metric.value} value={metric.value}>
					<Stack
						direction="row"
						justifyContent="space-between"
						width="full"
						align="center"
					>
						<Text color="secondaryContentOnEnabled">
							<Stack direction="row" align="center" gap="6">
								{metric.icon}
								{metric.name}
							</Stack>
						</Text>
						<IconSolidArrowsExpand />
					</Stack>
				</Select.Option>
			))}
		</Select>
	)
}

const Options = () => (
	<>
		{OPTIONS.map((option) => (
			<Select.Option key={option}>{option}</Select.Option>
		))}
	</>
)
