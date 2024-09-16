import {
	Box,
	Select,
	SelectOption,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import React from 'react'

export const OptionDropdown = <T extends string>({
	options,
	selection,
	setSelection,
	icons,
	labels,
	disabled,
}: {
	options: T[]
	selection: T
	setSelection: (option: T) => void
	icons?: JSX.Element[]
	labels?: string[]
	disabled?: boolean
}) => {
	const selectedIndex = options.indexOf(selection)
	const selectedIcon = icons?.at(selectedIndex)
	const selectedLabel = labels?.at(selectedIndex)
	return (
		<Box flex="stretch">
			<Select<T>
				value={selection}
				renderValue={() => {
					return (
						<Text color="secondaryContentOnEnabled">
							<Stack direction="row" alignItems="center" gap="4">
								{selectedIcon}
								{selectedLabel ?? selection}
							</Stack>
						</Text>
					)
				}}
				onValueChange={(v: SelectOption) => setSelection(v.value as T)}
				disabled={disabled}
			>
				{options.map((option, i) => (
					<Select.Option key={option} value={option}>
						<Text color="secondaryContentOnEnabled">
							<Stack direction="row" alignItems="center" gap="4">
								{icons?.at(i)}
								{labels?.at(i) ?? options?.at(i)}
							</Stack>
						</Text>
					</Select.Option>
				))}
			</Select>
		</Box>
	)
}
