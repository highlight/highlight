import { Progress as AntDesignProgress, ProgressProps } from 'antd'

type Props = ProgressProps

const Progress = (props: Props) => {
	return <AntDesignProgress {...props} />
}

export { Progress }
