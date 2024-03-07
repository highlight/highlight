import { Input as AntDesignInput } from 'antd'
import { TextAreaProps } from 'antd/es/input'
import clsx from 'clsx'

import styles from '../Input/Input.module.css'

type Props = TextAreaProps & {
	ref?: any
}

const TextArea = (props: Props) => {
	return (
		<AntDesignInput.TextArea
			{...props}
			className={clsx(props.className, styles.input)}
		/>
	)
}

export default TextArea
