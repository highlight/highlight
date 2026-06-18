import { DatePicker as AntDesignDatePicker, DatePickerProps } from 'antd'

type Props = DatePickerProps

const DatePicker = (props: Props) => {
	return <AntDesignDatePicker {...props} />
}

export { DatePicker }
