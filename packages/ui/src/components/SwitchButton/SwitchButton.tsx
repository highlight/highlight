import React from 'react'
import { IconProps } from '../icons'
import { Checkbox, CheckboxProps, useCheckboxState } from 'ariakit/checkbox'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'

type Props = Omit<CheckboxProps, 'size'> &
	styles.Variants & {
		iconLeft?: React.ReactElement<IconProps>
		iconRight?: React.ReactElement<IconProps>
	}

export const SwitchButton: React.FC<React.PropsWithChildren<Props>> = ({
	onChange,
	checked,
	iconLeft,
	iconRight,
	children,
	...rest
}) => {
	const className = styles.variants({
		variant: checked ? 'checked' : 'unchecked',
	})
	const checkbox = useCheckboxState()

	return (
		<Checkbox
			as="button"
			className={className}
			state={checkbox}
			onChange={onChange}
			checked={checked}
			{...rest}
		>
			{iconLeft && (
				<Box as="span" display="inline-flex">
					{iconLeft}
				</Box>
			)}
			{children && <Text size="xSmall">{children}</Text>}
			{iconRight && (
				<Box as="span" display="inline-flex">
					{iconRight}
				</Box>
			)}
		</Checkbox>
	)
}
