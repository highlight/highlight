import {
	Combobox,
	ComboboxItem,
	ComboboxList,
	PopoverArrow,
	Select,
	SelectItem,
	SelectLabel,
	SelectPopover,
	useComboboxStore,
	useSelectStore,
} from '@ariakit/react'
import clsx, { ClassValue } from 'clsx'
import React, { useState } from 'react'

import { vars } from '../../css/vars'
import { IconSolidCheckCircle, IconSolidSearch } from '../icons'
import { Text } from '../Text/Text'
import * as styles from './styles.css'

type Option = {
	key: string
	render: React.ReactNode
}

type Props<T extends string | string[]> = {
	label: string
	icon?: React.ReactNode
	value: T | undefined
	valueRender?: React.ReactNode
	options: Option[] | undefined
	onChange: (value: T) => void
	onChangeQuery?: (value: string) => void
	onClose?: () => void
	queryPlaceholder?: string
	cssClass?: ClassValue | ClassValue[]
	wrapperCssClass?: ClassValue | ClassValue[]
	popoverCssClass?: ClassValue | ClassValue[]
	creatableRender?: (key: string) => React.ReactNode | undefined
	defaultOpen?: boolean
	disabled?: boolean
	loadingRender?: React.ReactNode
	emptyStateRender?: React.ReactNode
}

export const ComboboxSelect = <T extends string | string[]>({
	label,
	icon,
	value,
	valueRender,
	options,
	onChange,
	onChangeQuery,
	onClose,
	queryPlaceholder,
	cssClass,
	wrapperCssClass,
	popoverCssClass,
	creatableRender,
	defaultOpen,
	disabled,
	loadingRender,
	emptyStateRender,
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
		<div className={clsx(wrapperCssClass)}>
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
				className={clsx([styles.selectPopover, popoverCssClass])}
				gutter={4}
				autoFocusOnHide={false}
				onClose={onClose}
			>
				<PopoverArrow size={0} />
				{onChangeQuery !== undefined && (
					<div
						className={clsx(styles.comboboxWrapper, {
							[styles.comboboxHasResults]:
								allOptions.length > 0 ||
								isLoading ||
								!!emptyStateRender,
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
				)}
				<ComboboxList
					store={combobox}
					className={clsx([styles.comboboxList, 'hide-scrollbar'])}
				>
					{isLoading && (
						<div
							className={clsx([
								styles.selectItem,
								styles.statePlaceholder,
							])}
						>
							{loadingRender}
						</div>
					)}
					{emptyStateRender &&
						!isLoading &&
						allOptions.length === 0 && (
							<div
								className={clsx([
									styles.selectItem,
									styles.statePlaceholder,
								])}
							>
								{emptyStateRender}
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
	const label = 'Select a color!'
	return (
		<ComboboxSelect
			label={label}
			value={value}
			valueRender={value || label}
			options={options}
			onChange={(valueNext: string) => {
				setValue(valueNext)
			}}
			onChangeQuery={() => undefined}
			queryPlaceholder="Filter..."
		/>
	)
}

// Will add a TS type package for this stuff soon!
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
ComboboxSelect_test.run = async ({ step }) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	await step('open dialog', async ({ screen, user }) => {
		const combobox = await screen.findByRole('combobox')
		await user.click(combobox)
		const dialog = await screen.findByRole('dialog')
		return {
			screenshotOptions: {
				element: dialog,
			},
		}
	})

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	await step('enter filter text', async ({ screen, user }) => {
		const filterInput = await screen.findByPlaceholderText('Filter...')
		await user.type(filterInput, 're')
		return {
			screenshotOptions: {
				element: filterInput,
			},
		}
	})

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	await step('select option', async ({ screen, user }) => {
		const redOption = await screen.findByText('Red')
		await user.click(redOption)
	})
}
