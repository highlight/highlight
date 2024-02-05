import { IconSolidCheveronDown } from '@highlight-run/ui/components'
import { Dropdown } from 'antd'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'

import styles from './StandardDropdown.module.css'

type Option = {
	label: string
	value: number | string
}

export const StandardDropdown = ({
	data,
	onSelect,
	display,
	renderOption,
	defaultValue,
	value,
	disabled,
	gray,
	placeholder,
	className,
	labelClassName,
}: {
	data: ReadonlyArray<Option>
	onSelect: React.Dispatch<React.SetStateAction<any>>
	display?: React.ReactNode
	renderOption?: (o: Option) => React.ReactNode | undefined
	defaultValue?: Option
	value?: Option
	disabled?: boolean
	gray?: boolean
	placeholder?: string
	className?: string
	labelClassName?: string
}) => {
	const [visible, setVisible] = useState(false)
	const [selection, setSelection] = useState(defaultValue)

	useEffect(() => {
		if (value !== undefined) {
			setSelection(value)
		}
	}, [value])

	const menu = (
		<div className={styles.dropdownMenu}>
			<div className={styles.dropdownInner}>
				{data?.map((o) => (
					<div
						className={styles.labelItem}
						key={o?.label}
						onClick={() => {
							onSelect(o.value)
							setSelection(o)
							setVisible(false)
						}}
					>
						<div className={styles.labelText}>
							{renderOption && renderOption(o)
								? renderOption(o)
								: o?.label}
						</div>
					</div>
				))}
			</div>
		</div>
	)
	return (
		<Dropdown
			placement="bottomLeft"
			overlay={menu}
			onVisibleChange={(v) => setVisible(v)}
			trigger={['click']}
			disabled={disabled}
			className={className}
			overlayClassName={styles.overlay}
		>
			<div
				className={clsx(styles.dropdownHandler, {
					[styles.dropdownGray]: gray,
				})}
				onClick={(e) => e.preventDefault()}
			>
				{display ? (
					display
				) : (
					<div className={clsx(styles.labelNameText, labelClassName)}>
						{selection ? (
							selection?.label
						) : placeholder ? (
							<span className={styles.placeholder}>
								{placeholder}
							</span>
						) : null}
					</div>
				)}
				<IconSolidCheveronDown
					className={styles.icon}
					style={{
						transform: visible ? 'rotate(180deg)' : 'rotate(0deg)',
					}}
				/>
			</div>
		</Dropdown>
	)
}
