import { Input as AntDesignInput, InputProps } from 'antd'
import clsx from 'clsx'
import React from 'react'

import styles from './Input.module.scss'

type Props = InputProps & {
	ref?: any
}

const Input = (props: Props) => {
	return (
		<AntDesignInput
			{...props}
			className={clsx(props.className, styles.input)}
		/>
	)
}

export default Input
