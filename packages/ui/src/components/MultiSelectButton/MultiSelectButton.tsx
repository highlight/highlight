import React, { useEffect, useRef } from 'react'
import {
	useComboboxStore,
	useSelectStore,
	// useComboboxState,
	// useSelectState,
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
	query?: string
	onChangeQuery?: (value: string) => void
	queryPlaceholder?: string
	cssClass?: ClassValue | ClassValue[]
	open?: boolean
	onToggle?: (isOpen: boolean) => void
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
	open,
	onToggle,
	query,
}) => {
	const inputElement = useRef<HTMLInputElement>(null)

	// const combobox = useComboboxStore({ resetValueOnHide: true })
	// const select = useSelectStore({
	// 	combobox,
	// 	defaultValue: defaultValue ? [defaultValue] : [],
	// 	setValue: (value: string[]) => onChange(value),
	// 	value: value,
	// })

	const combobox = useComboboxStore({
		// gutter: 4,
		// sameWidth: true,
		open,
		setOpen: (open) => {
			// if (combobox.open !== open) {
			onToggle?.(open)
			// }
		},
		value: query,
		setValue: (value) => {
			// if (combobox.value !== value) {
			onChangeQuery?.(value)
			// }
		},
		// virtualFocus: true,
	})

	const select = useSelectStore({
		...combobox,
		defaultValue: defaultValue ? [defaultValue] : [],
		setValue: (value: string[]) => onChange(value),
		value: value,
	})

	// useEffect(() => {
	// 	if (select.mounted) return
	// 	combobox.setValue('')
	// }, [select.mounted, combobox.setValue])

	return (
		<div>
			{/* <SelectLabel state={select} className={styles.selectLabel}>
				{label}
			</SelectLabel> */}
			<Select
				moveOnKeyDown={false}
				// state={select}
				store={select}
				className={clsx([styles.selectButton, clsx(cssClass)])}
			>
				{/* <>
					{icon}
					<Text size="xSmall" color="secondaryContentText">
						{valueRender()}
					</Text>
				</> */}
			</Select>
			<SelectPopover
				// state={select}
				store={select}
				className={styles.selectPopover}
				// initialFocusRef={inputElement}
				// initialFocus={inputElement}
				focusable={false}
				focusOnMove={false}
				moveOnKeyPress={false}
			>
				<Combobox
					// state={combobox}
					store={combobox}
					// ref={inputElement}
					type="text"
					// autoSelect
					placeholder={queryPlaceholder}
				></Combobox>
				<ComboboxList
					// state={combobox}
					tabIndex={0}
					store={combobox}
				>
					{options.map((option: Option) => (
						<ComboboxItem
							key={option.key}
							value={option.key}
							className={styles.selectItem}
							// state={combobox}
							store={combobox}
							focusOnHover
							render={
								<SelectItem value={option.key}>
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
							}
						>
							{/* {(props) => (
								<SelectItem {...props} value={option.key}>
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
							)} */}
						</ComboboxItem>
					))}
				</ComboboxList>
			</SelectPopover>
		</div>
	)
}
