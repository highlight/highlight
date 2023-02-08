import analytics from '@util/analytics'
import {
	// eslint-disable-next-line no-restricted-imports
	Select as AntDesignSelect,
	SelectProps as AntDesignSelectProps,
} from 'antd'
import React from 'react'

import SvgChevronDownIcon from '../../../static/ChevronDownIcon'
import styles from './TextSelect.module.scss'
const { Option } = AntDesignSelect

type Props = Pick<
	AntDesignSelectProps<any>,
	| 'onChange'
	| 'placeholder'
	| 'loading'
	| 'value'
	| 'className'
	| 'allowClear'
	| 'notFoundContent'
	| 'mode'
	| 'dropdownRender'
	| 'defaultValue'
	| 'onSearch'
	| 'children'
	| 'optionLabelProp'
	| 'filterOption'
	| 'open'
> & {
	options?: {
		value: string
		displayValue: string | React.ReactNode
		disabled?: boolean
		id: string
	}[]
	displayValue: string | undefined
}

const TextSelect = ({
	options,
	className,
	children,
	displayValue,
	...props
}: Props) => {
	return (
		<div className={styles.textSelectContainer}>
			<h2
				className={styles.displayValue}
				onClick={() => {
					analytics.track('TextSelectDisplayValue')
				}}
			>
				{displayValue}
			</h2>
			<AntDesignSelect
				{...props}
				disabled={props.loading}
				onChange={(applicationId, newOption) => {
					if (props.onChange) {
						props.onChange(applicationId, newOption)
					}
				}}
				className={clsx(className, styles.select)}
				menuItemSelectedIcon={null}
				defaultActiveFirstOption={false}
				dropdownClassName={styles.dropdown}
				suffixIcon={
					<SvgChevronDownIcon
						className={clsx({
							[styles.suffixIconActive]: !!props.value,
						})}
					/>
				}
			>
				{options?.map(({ displayValue, value, disabled, id }) => (
					<Option key={id} value={value} disabled={disabled}>
						{displayValue}
					</Option>
				))}
				{children}
			</AntDesignSelect>
		</div>
	)
}

export default TextSelect
