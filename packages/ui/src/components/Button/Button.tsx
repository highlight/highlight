import React from 'react'
import { useButton, AriaButtonProps } from 'react-aria'

import * as styles from './styles.css'

type Props = styles.Variants &
	AriaButtonProps & {
		title?: string
		type?: 'button' | 'submit'
		onPress?: () => void
	}

export const Button: React.FC<Props> = (props) => {
	const ref = React.useRef()
	const { buttonProps } = useButton(props, ref)

	return (
		<button
			ref={ref}
			className={styles.variants({
				variant: props.variant,
				size: props.size,
			})}
			{...buttonProps}
		>
			{props.children}
		</button>
	)
}
