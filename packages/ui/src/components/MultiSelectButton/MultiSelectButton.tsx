import React from 'react'
import {
	useSelectState,
	Select,
	SelectItem,
	SelectItemCheck,
	SelectLabel,
	SelectPopover,
} from 'ariakit'

import * as styles from './styles.css'

type Option = {
	key: string
	render: React.ReactNode
}

type Props = {
	label: string
	icon?: React.ReactNode
	defaultValue?: string
	value?: string[]
	options: Option[]
	onChange: (value: string[]) => void
}

export const MultiSelectButton: React.FC<Props> = ({
	label,
	icon,
	defaultValue,
	value,
	options,
	onChange,
}) => {
	const selectState = useSelectState({
		defaultValue: defaultValue ? [defaultValue] : [],
		setValue: (value: string[]) => onChange(value),
		value: value,
	})

	const renderValue = (value: string[]) => {
		if (value.length === 0) return `${label}: none selected`
		if (value.length === 1) return `${label}: ${value[0]}`
		return `${label}: ${value.length} selected`
	}

	return (
		<>
			<SelectLabel state={selectState} className={styles.selectLabel}>
				{label}
			</SelectLabel>
			<Select state={selectState} className={styles.selectButton}>
				{icon}
				{renderValue(selectState.value)}
			</Select>
			{selectState.mounted && (
				<SelectPopover
					state={selectState}
					className={styles.selectPopover}
				>
					{options.map((option: Option) => (
						<SelectItem
							key={option.key}
							value={option.key}
							className={styles.selectItem}
						>
							{option.render}
							<SelectItemCheck />
						</SelectItem>
					))}
				</SelectPopover>
			)}
		</>
	)
}
