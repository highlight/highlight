import React from 'react'
import {
	useSelectState,
	Select,
	SelectItem,
	SelectLabel,
	SelectPopover,
} from 'ariakit'

import { IconSolidCheckCircle, IconSolidMinus } from '../icons'

import * as styles from './styles.css'
import { Text } from '../Text/Text'

type Option = {
	key: string
	render: React.ReactNode
	clearsOnClick?: boolean
}

type Props = {
	label: string
	icon?: React.ReactNode
	defaultValue?: string
	value: string[]
	valueRender: () => React.ReactNode
	options: Option[]
	onChange: (value: string[]) => void
}

export const MultiSelectButton: React.FC<Props> = ({
	label,
	icon,
	defaultValue,
	value,
	valueRender,
	options,
	onChange,
}) => {
	const selectState = useSelectState({
		defaultValue: defaultValue ? [defaultValue] : [],
		setValue: (value: string[]) => onChange(value),
		value: value,
	})

	return (
		<>
			<SelectLabel state={selectState} className={styles.selectLabel}>
				{label}
			</SelectLabel>
			<Select state={selectState} className={styles.selectButton}>
				<>
					{icon}
					<Text size="xSmall" color="secondaryContentText">
						{valueRender()}
					</Text>
				</>
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
							<div className={styles.checkbox}>
								{option.clearsOnClick &&
								!value.includes(option.key) ? (
									<IconSolidMinus color="grey" />
								) : (
									<IconSolidCheckCircle color="white" />
								)}
							</div>
							{option.render}
						</SelectItem>
					))}
				</SelectPopover>
			)}
		</>
	)
}
