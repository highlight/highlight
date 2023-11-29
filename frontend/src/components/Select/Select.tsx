import { colors } from '@highlight-run/ui/colors'
import { IconSolidCheveronDown } from '@highlight-run/ui/components'
import {
	// eslint-disable-next-line no-restricted-imports
	Select as AntDesignSelect,
	SelectProps as AntDesignSelectProps,
} from 'antd'
import clsx from 'clsx'
import React from 'react'

import styles from './Select.module.css'

const { Option } = AntDesignSelect

export interface OptionType {
	value: string
	displayValue: React.ReactNode
	disabled?: boolean
	id: string
	dropDownIcon?: React.ReactNode
}

type Props = Omit<AntDesignSelectProps, 'options'> & {
	options?: OptionType[]
	dropdownClassName?: string
}

const Select = ({
	options,
	className,
	dropdownClassName,
	children,
	defaultActiveFirstOption = false,
	...props
}: Props) => {
	return (
		<AntDesignSelect
			// @ts-ignore
			autoComplete="dontshow"
			{...props}
			disabled={props.loading || props.disabled}
			className={clsx(styles.select, className)}
			menuItemSelectedIcon={null}
			defaultActiveFirstOption={defaultActiveFirstOption}
			dropdownClassName={clsx(dropdownClassName, styles.dropdown)}
			suffixIcon={
				props.loading ? undefined : (
					<IconSolidCheveronDown color={colors.n9} />
				)
			}
		>
			{options?.map(
				({ displayValue, value, disabled, id, dropDownIcon }) => {
					let display = displayValue
					if (!!dropDownIcon) {
						display = (
							<div className={styles.dropdownIcon}>
								{displayValue}{' '}
								<div className={styles.icon}>
									{dropDownIcon}
								</div>
							</div>
						)
					}

					return (
						<Option
							key={id}
							value={value}
							disabled={disabled}
							label={displayValue}
						>
							{display}
						</Option>
					)
				},
			)}
			{children}
		</AntDesignSelect>
	)
}

export default Select
