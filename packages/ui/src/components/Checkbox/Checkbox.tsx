import {
	Checkbox as AriakitCheckbox,
	CheckboxProps as AriakitCheckboxProps,
	VisuallyHidden as AriakitVisuallyHidden,
	useCheckboxStore,
} from '@ariakit/react'
import React, { useEffect } from 'react'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'

import * as styles from './styles.css'
import { IconSolidCheck } from '@/components/icons'
import { vars } from '@/vars'

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
	ref,
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
			<AriakitVisuallyHidden>
				<AriakitCheckbox
					ref={ref}
					clickOnEnter
					className={styles.checkboxSize({ size })}
					onChange={(event) => {
						onChange?.(event)
					}}
				/>
			</AriakitVisuallyHidden>
			{checked && (
				<Box data-checked={checked} cssClass={styles.checkMark}>
					<IconSolidCheck
						color={vars.theme.interactive.fill.secondary.disabled}
					/>
				</Box>
			)}
			{label && (
				<Text size={size === 'large' ? 'medium' : 'small'}>
					{label}
				</Text>
			)}
		</Box>
	)
}
