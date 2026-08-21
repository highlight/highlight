import clsx from 'clsx'
import React from 'react'

import styles from './Input.module.css'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
	ref?: React.Ref<HTMLInputElement>
}

const Input = ({ className, ...props }: Props) => {
	return (
		<input
			{...props}
			className={clsx(className, styles.input)}
		/>
	)
}

export default Input
