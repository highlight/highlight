import { Checkbox, CheckboxProps, useCheckboxStore } from '@ariakit/react'
import React from 'react'

import clsx from 'clsx'
import { Box } from '../Box/Box'
import { IconProps } from '../icons'
import { Text } from '../Text/Text'
import * as styles from './styles.css'

type Props = Omit<CheckboxProps, 'size'> &
	styles.Variants & {
		iconLeft?: React.ReactElement<IconProps>
		iconRight?: React.ReactElement<IconProps>
	}

export const SwitchButton: React.FC<React.PropsWithChildren<Props>> = ({
	className,
	onChange,
	checked,
	size,
	iconLeft,
	iconRight,
	children,
	...rest
}) => {
	const variants = styles.variants({
		size,
		variant: checked ? 'checked' : 'unchecked',
	})
	const checkbox = useCheckboxStore()

	return (
		<Checkbox
			render={<button />}
			className={clsx(className, variants)}
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
