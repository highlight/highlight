import React from 'react'
import { IconProps } from '../icons'
import { Checkbox, CheckboxProps, useCheckboxStore } from '@ariakit/react'

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
	size,
	iconLeft,
	iconRight,
	children,
	...rest
}) => {
	const className = styles.variants({
		size,
		variant: checked ? 'checked' : 'unchecked',
	})
	const checkbox = useCheckboxStore()

	return (
		<Checkbox
			render={<button />}
			className={className}
			store={checkbox}
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
