import { Checkbox as AntDesignCheckbox, CheckboxProps } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'

type Props = CheckboxProps

const Checkbox = (props: Props) => {
	return <AntDesignCheckbox {...props} />
}

export { Checkbox }
export type { CheckboxChangeEvent }
