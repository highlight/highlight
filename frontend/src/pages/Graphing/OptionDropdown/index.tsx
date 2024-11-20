import {
	Box,
	Select,
	SelectOption,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import React, { useMemo } from 'react'

type Options<T> = T[] | SelectOption[]

export const OptionDropdown = <T extends string>({
	options,
	selection,
	setSelection,
	disabled,
}: {
	options: Options<T>
	selection: T
	setSelection: (option: T) => void
	disabled?: boolean
}) => {
	return (
		<Box flex="stretch">
			<Select<T>
				value={selection}
				renderValue={(value) => {
					return (
						<Text color="secondaryContentOnEnabled">
							<Stack direction="row" alignItems="center" gap="4">
								<SelectValue
									options={options}
									value={value as T}
								/>
							</Stack>
						</Text>
					)
				}}
				options={options}
				onValueChange={(v: SelectOption) => {
					const newSelection = v.value as T
					if (newSelection !== selection) {
						setSelection(newSelection)
					}
				}}
				disabled={disabled}
			/>
		</Box>
	)
}

const SelectValue = <T extends string>({
	options,
	value,
}: {
	options: Options<T>
	value: T
}) => {
	const selectedOption = useMemo(() => {
		if (typeof options === 'string') {
			return value
		}

		return (
			(options as SelectOption[]).find((opt) => opt.value === value) ||
			value
		)
	}, [options, value])

	if (typeof selectedOption === 'string') {
		return value
	}

	return (
		<>
			{selectedOption.icon}
			{selectedOption.name || selectedOption.value}
		</>
	)
}
