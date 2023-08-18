import React, { useRef } from 'react'
import {
	useSelectState,
	Select,
	SelectItem,
	SelectLabel,
	SelectPopover,
} from 'ariakit'

import * as styles from '../MultiSelectButton/styles.css'
import { Text } from '../Text/Text'
import clsx, { ClassValue } from 'clsx'

type Option = {
	key: string
	render: React.ReactNode
}

type Props = {
	label: string
	icon?: React.ReactNode
	defaultValue?: string
	value: string
	valueRender: () => React.ReactNode
	options: Option[]
	onChange: (value: string) => void
	onChangeQuery?: (value: string) => void
	queryPlaceholder?: string
	cssClass?: ClassValue | ClassValue[]
}

export const SelectButton: React.FC<Props> = ({
	label,
	icon,
	defaultValue,
	value,
	valueRender,
	options,
	onChange,
	onChangeQuery,
	queryPlaceholder,
	cssClass,
}) => {
	const inputElement = useRef<HTMLInputElement>(null)

	const selectState = useSelectState({
		defaultValue: defaultValue,
		setValue: (value: string) => onChange(value),
		value: value,
	})

	return (
		<>
			<SelectLabel state={selectState} className={styles.selectLabel}>
				{label}
			</SelectLabel>
			<Select
				state={selectState}
				className={clsx([styles.selectButton, clsx(cssClass)])}
			>
				{icon}
				<Text size="xSmall" color="secondaryContentText">
					{valueRender()}
				</Text>
			</Select>
			{selectState.mounted && (
				<SelectPopover
					state={selectState}
					className={styles.selectPopover}
					initialFocusRef={inputElement}
				>
					{onChangeQuery && (
						<input
							ref={inputElement}
							type="text"
							onChange={(e) => {
								onChangeQuery(e.target?.value)
							}}
							placeholder={queryPlaceholder}
						></input>
					)}
					{options.map((option: Option) => (
						<SelectItem
							key={option.key}
							value={option.key}
							className={styles.selectItem}
						>
							{option.render}
						</SelectItem>
					))}
				</SelectPopover>
			)}
		</>
	)
}
