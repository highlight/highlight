// eslint-disable-next-line no-restricted-imports
import { InputNumber as AntDesignInputNumber, InputNumberProps } from 'antd'
import React from 'react'

import styles from './InputNumber.module.scss'

type Props = Pick<
	InputNumberProps,
	'value' | 'defaultValue' | 'onChange' | 'min'
>

const InputNumber = (props: Props) => {
	return <AntDesignInputNumber {...props} className={styles.inputNumber} />
}

export default InputNumber
