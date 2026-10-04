import { Dropdown as AntDesignDropdown, DropDownProps } from 'antd'

type Props = DropDownProps

const Dropdown = (props: Props) => {
	return <AntDesignDropdown {...props} />
}

export { Dropdown }
