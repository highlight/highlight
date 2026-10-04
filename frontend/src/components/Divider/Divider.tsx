import { Divider as AntDesignDivider, DividerProps } from 'antd'

type Props = DividerProps

const Divider = (props: Props) => {
	return <AntDesignDivider {...props} />
}

export { Divider }
