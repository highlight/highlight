import { Input as AntDesignInput } from 'antd'
import { TextAreaProps } from 'antd/lib/input'
import classNames from 'classnames'
import React from 'react'

import styles from '../Input/Input.module.scss'

type Props = TextAreaProps & {
	ref?: any
}

const TextArea = (props: Props) => {
	return (
		<AntDesignInput.TextArea
			{...props}
			className={classNames(props.className, styles.input)}
		/>
	)
}

export default TextArea
