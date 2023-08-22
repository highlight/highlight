import React, { useRef } from 'react'
import {
	useComboboxStore,
	useSelectStore,
	ComboboxList,
	ComboboxItem,
	Combobox,
	Select,
	SelectItem,
	SelectLabel,
	SelectPopover,
} from '@ariakit/react'

import { IconSolidCheckCircle, IconSolidMinus } from '../icons'

import * as styles from './styles.css'
import { Text } from '../Text/Text'
import clsx, { ClassValue } from 'clsx'

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
	onChangeQuery?: (value: string) => void
	queryPlaceholder?: string
	cssClass?: ClassValue | ClassValue[]
}

export const MultiSelectButton: React.FC<Props> = ({
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

	const combobox = useComboboxStore({ resetValueOnHide: true })
	const select = useSelectStore({
		combobox,
		defaultValue: defaultValue ? [defaultValue] : [],
		setValue: (value: string[]) => onChange(value),
		value: value,
	})

	// const selectState = useSelectState({
	// 	defaultValue: defaultValue ? [defaultValue] : [],
	// 	setValue: (value: string[]) => onChange(value),
	// 	value: value,
	// })

	return (
		<>
			<SelectLabel store={select} className={styles.selectLabel}>
				{label}
			</SelectLabel>
			<Select
				store={select}
				className={clsx([styles.selectButton, clsx(cssClass)])}
			>
				<>
					{icon}
					<Text size="xSmall" color="secondaryContentText">
						{valueRender()}
					</Text>
				</>
			</Select>
			<SelectPopover store={select} className={styles.selectPopover}>
				{onChangeQuery && (
					<Combobox
						store={combobox}
						ref={inputElement}
						type="text"
						onChange={(e) => {
							onChangeQuery(e.target?.value)
						}}
						placeholder={queryPlaceholder}
					></Combobox>
				)}
				<ComboboxList store={combobox}>
					{options.map((option: Option) => (
						<ComboboxItem key={option.key}>
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
						</ComboboxItem>
					))}
				</ComboboxList>
			</SelectPopover>
		</>
	)
}
