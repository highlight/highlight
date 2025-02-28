import {
	Checkbox as AriakitCheckbox,
	CheckboxProps as AriakitCheckboxProps,
	useCheckboxStore,
} from '@ariakit/react'
import React, { useEffect } from 'react'
import { Box } from '../Box/Box'
import { IconSolidCheck } from '../icons'
import { Text } from '../Text/Text'
import * as styles from './styles.css'

type CheckboxProps = Omit<AriakitCheckboxProps, 'size' | 'store'> & {
	label?: string
	size?: 'small' | 'medium' | 'large'
	checked?: boolean
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const Checkbox: React.FC<CheckboxProps> = ({
	checked = false,
	onChange,
	label,
	size = 'medium',
	...rest
}) => {
	// Create a checkbox store
	const checkbox = useCheckboxStore({
		value: checked,
	})

	// Keep local state in sync with external props
	useEffect(() => {
		checkbox.setValue(checked)
	}, [checked, checkbox])

	return (
		<Box display="flex" alignItems="center" gap="2">
			<Box
				position="relative"
				cssClass={[styles.checkbox, styles.checkboxSize({ size })]}
			>
				<AriakitCheckbox
					store={checkbox}
					className={styles.input}
					onChange={onChange}
					{...rest}
				/>
			</Box>
			{label && (
				<Text size={size === 'large' ? 'medium' : 'small'}>
					{label}
				</Text>
			)}
		</Box>
	)
}
