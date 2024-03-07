// eslint-disable-next-line no-restricted-imports
import { InputNumber as AntDesignInputNumber, InputNumberProps } from 'antd'

import styles from './InputNumber.module.css'

type Props = Pick<
	InputNumberProps,
	'value' | 'defaultValue' | 'onChange' | 'min'
>

const InputNumber = (props: Props) => {
	return <AntDesignInputNumber {...props} className={styles.inputNumber} />
}

export default InputNumber
