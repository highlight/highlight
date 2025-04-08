import {
	Box,
	IconSolidInformationCircle,
	Select,
	SelectOption,
	Stack,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { useMemo } from 'react'

export const OptionDropdown = <T extends string>({
	options,
	selection,
	setSelection,
	disabled,
}: {
	options: SelectOption[]
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
				onValueChange={(v: SelectOption) => {
					const newSelection = v.value as T
					if (newSelection !== selection) {
						setSelection(newSelection)
					}
				}}
				disabled={disabled}
			>
				{options.map((option) => (
					<Select.Option
						key={option.value}
						value={String(option.value)}
					>
						<Stack
							direction="row"
							justifyContent="space-between"
							width="full"
							align="center"
							color="secondaryContentOnEnabled"
						>
							<Stack direction="row" gap="6" align="center">
								{option.icon}
								<Text>{option.name}</Text>
							</Stack>
							{option.info && (
								<Tooltip
									trigger={
										<Tag
											kind="secondary"
											size="medium"
											shape="basic"
											emphasis="low"
											iconRight={
												<IconSolidInformationCircle />
											}
										/>
									}
								>
									{option.info}
								</Tooltip>
							)}
						</Stack>
					</Select.Option>
				))}
			</Select>
		</Box>
	)
}

const SelectValue = ({
	options,
	value,
}: {
	options: SelectOption[]
	value: string
}) => {
	const selectedOption = useMemo(() => {
		return (
			(options as SelectOption[]).find((opt) => opt.value === value) || {
				name: value,
				value: value,
			}
		)
	}, [options, value])

	return (
		<>
			{selectedOption.icon}
			{selectedOption.name || selectedOption.value}
		</>
	)
}
