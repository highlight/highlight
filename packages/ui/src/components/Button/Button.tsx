import React from 'react'
import { Button as AriakitButton, ButtonProps } from 'ariakit/button'

import * as styles from './styles.css'

type Props = ButtonProps &
	styles.Variants & {
		onPress?: () => void
	}

export const Button: React.FC<Props> = ({ children, ...props }) => {
	return (
		<AriakitButton
			as="button"
			className={styles.variants({
				variant: props.variant,
				size: props.size,
			})}
			{...props}
		>
			{children}
		</AriakitButton>
	)
}
