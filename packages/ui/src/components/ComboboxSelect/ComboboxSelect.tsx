import React, { useState } from 'react'
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
	PopoverArrow,
} from '@ariakit/react'

import { IconSolidCheckCircle, IconSolidSearch } from '../icons'

import * as styles from './styles.css'
import { Text } from '../Text/Text'
import clsx, { ClassValue } from 'clsx'
import { vars } from '../../css/vars'

type Option = {
	key: string
	render: React.ReactNode
}

type Props<T extends string | string[]> = {
	label: string
	icon?: React.ReactNode
	value: T | undefined
	valueRender: React.ReactNode
	options: Option[] | undefined
	onChange: (value: T) => void
	onChangeQuery?: (value: string) => void
	queryPlaceholder?: string
	cssClass?: ClassValue | ClassValue[]
	creatableRender?: (key: string) => React.ReactNode | undefined
	defaultOpen?: boolean
	disabled?: boolean
	loadingRender?: React.ReactNode
}

export const ComboboxSelect = <T extends string | string[]>({
	label,
	icon,
	value,
	valueRender,
	options,
	onChange,
	onChangeQuery,
	queryPlaceholder,
	cssClass,
	creatableRender,
	defaultOpen,
	disabled,
	loadingRender,
}: Props<T>) => {
	const isMultiselect = typeof value === 'object'

	const combobox = useComboboxStore({
		setValue: (value) => {
			onChangeQuery?.(value)
		},
		resetValueOnHide: true,
		defaultOpen: defaultOpen,
	})

	const select = useSelectStore({
		combobox,
		setValue: (value: T) => {
			onChange(value)
			if (isMultiselect && defaultOpen) {
				combobox.setOpen(false)
			}
		},
		value,
	})

	const valueSet = new Set(value)

	const query = combobox.useState('value')

	const isLoading = options === undefined

	const queryOptions: Option[] =
		query !== undefined && query !== '' && creatableRender !== undefined
			? [{ key: query, render: creatableRender(query) }]
			: []
	const createdOptions =
		isMultiselect && creatableRender
			? value
					.filter((v) => v !== query)
					.map((v) => ({ key: v, render: creatableRender(v) }))
			: []

	const allOptions = queryOptions.concat(createdOptions).concat(options ?? [])

	return (
		<div>
			<SelectLabel store={select} className={styles.selectLabel}>
				{label}
			</SelectLabel>
			<Select
				store={select}
				className={clsx([styles.selectButton, cssClass])}
				disabled={disabled}
			>
				{icon}
				{valueRender && (
					<Text size="xSmall" color="secondaryContentText" lines="1">
						{valueRender}
					</Text>
				)}
			</Select>
			<SelectPopover
				store={select}
				className={styles.selectPopover}
				gutter={4}
				autoFocusOnHide={false}
			>
				<PopoverArrow size={0} />
				<div
					className={clsx(styles.comboboxWrapper, {
						[styles.comboboxHasResults]:
							allOptions.length > 0 || isLoading,
					})}
				>
					<IconSolidSearch />
					<Combobox
						store={combobox}
						type="text"
						autoSelect
						autoComplete="none"
						placeholder={queryPlaceholder}
						className={styles.combobox}
					></Combobox>
				</div>
				<ComboboxList
					store={combobox}
					className={clsx([styles.comboboxList, 'hide-scrollbar'])}
				>
					{isLoading && (
						<div
							className={clsx([
								styles.selectItem,
								styles.loadingPlaceholder,
							])}
						>
							{loadingRender}
						</div>
					)}
					{select.useState('open') &&
						allOptions.map((option: Option) => (
							<ComboboxItem
								focusOnHover
								key={option.key}
								className={styles.selectItem}
								render={
									<SelectItem value={option.key}>
										{isMultiselect && (
											<div
												className={styles.checkbox}
												style={{
													backgroundColor:
														valueSet.has(option.key)
															? vars.theme
																	.interactive
																	.fill
																	.primary
																	.enabled
															: 'white',
												}}
											>
												<IconSolidCheckCircle color="white" />
											</div>
										)}
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

export const ComboboxSelect_test = () => {
	const [value, setValue] = useState('')
	const options = [
		{ key: 'red', render: 'Red' },
		{ key: 'blue', render: 'Blue' },
		{ key: 'green', render: 'Green' },
	]
	const label = 'Select a color'
	return (
		<ComboboxSelect
			label={label}
			value={value}
			valueRender={value || label}
			options={options}
			onChange={(valueNext: string) => {
				setValue(valueNext)
			}}
			queryPlaceholder="Filter..."
		/>
	)
}

ComboboxSelect_test.run = async ({ user, screen, captureScreenshot }) => {
	const combobox = await screen.findByRole('combobox')
	await captureScreenshot(combobox, { name: 'initial' })

	await user.click(combobox)
	const dialog = await screen.findByRole('dialog')
	await captureScreenshot(dialog, { name: 'dialog opened' })

	const filterInput = await screen.findByPlaceholderText('Filter...')

	await user.type(filterInput, 're')
	await captureScreenshot(dialog, { name: 'filter entered' })

	const redOption = await screen.findByText('Red')
	await user.click(redOption)
}
