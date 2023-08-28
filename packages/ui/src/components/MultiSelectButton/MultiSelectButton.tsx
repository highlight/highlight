import React, { useEffect, useRef } from 'react'
import {
	useComboboxStore,
	useSelectStore,
	// useComboboxState,
	// useSelectState,
	ComboboxPopover,
	ComboboxList,
	ComboboxItem,
	Combobox,
	Select,
	SelectItem,
	SelectLabel,
	SelectPopover,
	PopoverArrow,
} from '@ariakit/react'

import { IconSolidCheckCircle, IconSolidMinus } from '../icons'

import * as styles from './styles.css'
import { Text } from '../Text/Text'
import clsx, { ClassValue } from 'clsx'
import { vars } from '../../css/vars'

type Option = {
	key: string
	render: React.ReactNode
	clearsOnClick?: boolean
}

type Props<T extends string | string[]> = {
	label: string
	icon?: React.ReactNode
	defaultValue?: string
	value: string[]
	valueRender: () => React.ReactNode
	options: Option[]
	onChange: (value: T) => void
	query?: string
	onChangeQuery?: (value: string) => void
	queryPlaceholder?: string
	cssClass?: ClassValue | ClassValue[]
	open?: boolean
	onToggle?: (isOpen: boolean) => void
}

export const MultiSelectButton = <T extends string | string[]>({
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
}: Props<T>) => {
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
		// setOpen: (open) => {
		// 	// if (combobox.open !== open) {
		// 	onToggle?.(open)
		// 	// }
		// },
		value: query,
		setValue: (value) => {
			// if (combobox.value !== value) {
			onChangeQuery?.(value)
			// }
		},
		resetValueOnHide: true,
		// virtualFocus: true,
	})

	const select = useSelectStore({
		combobox,
		defaultValue: defaultValue ? [defaultValue] : [],
		setValue: (value: T) => onChange(value),
		value: value,
	})

	const valueSet = new Set(value)

	return (
		<div className="wrapper">
			<SelectLabel store={select} className={styles.selectLabel}>
				label
			</SelectLabel>
			<Select
				// moveOnKeyDown={false}
				// state={select}
				store={select}
				className={clsx([
					styles.selectButton,
					clsx(cssClass),
					'select',
				])}
			>
				{icon}
				<Text size="xSmall" color="secondaryContentText">
					{valueRender()}
				</Text>
			</Select>
			<SelectPopover
				// state={select}
				store={select}
				className={clsx([styles.selectPopover, 'popover'])}
				// initialFocusRef={inputElement}
				// initialFocus={inputElement}
				// focusable={false}
				// focusOnMove={false}
				// moveOnKeyPress={false}
			>
				<PopoverArrow size={0} />
				{/* <div>
					<Combobox store={combobox} placeholder="e.g., Apple" />
					<ComboboxList store={combobox}>
						{options.length ? (
							options.map((value) => (
								<ComboboxItem
									key={value.key}
									value={value.key}
								/>
							))
						) : (
							<div>No results found</div>
						)}
					</ComboboxList>
				</div> */}
				<div className="combobox-wrapper">
					<Combobox
						// state={combobox}
						store={combobox}
						// ref={inputElement}
						type="text"
						// autoSelect
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoSelect
						placeholder={queryPlaceholder}
						className="combobox"
					></Combobox>
				</div>
				<ComboboxList
					// state={combobox}
					store={combobox}
				>
					{options.map((option: Option) => (
						<ComboboxItem
							key={option.key}
							className={clsx([styles.selectItem, 'select-item'])}
							// state={combobox}
							// focusOnHover
							render={
								<SelectItem value={option.key}>
									<div
										className={styles.checkbox}
										style={{
											backgroundColor: valueSet.has(
												option.key,
											)
												? vars.theme.interactive.fill
														.primary.enabled
												: 'white',
										}}
									>
										{option.clearsOnClick &&
										!valueSet.has(option.key) ? (
											<IconSolidMinus color="grey" />
										) : (
											<IconSolidCheckCircle color="white" />
										)}
									</div>
									{option.render}
								</SelectItem>
							}
						></ComboboxItem>
					))}
				</ComboboxList>
			</SelectPopover>
		</div>
	)
}
