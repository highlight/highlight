import React from 'react'
import { Box } from '../Box/Box'

import * as styles from './styles.css'

type Props = React.PropsWithChildren &
	styles.Variants & {
		disabled?: boolean
		type?: 'button' | 'submit'
		onClick?: () => void
	}

export const Button: React.FC<Props> = ({
	children,
	disabled = false,
	type = 'button',
	...props
}) => {
	return (
		<Box
			as="button"
			disabled={disabled}
			type={type}
			cssClass={styles.variants({ ...props })}
		>
			{children}
		</Box>
	)
}
