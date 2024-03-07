import { Input as AntDesignInput, InputProps } from 'antd'
import clsx from 'clsx'

import styles from './Input.module.css'

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
