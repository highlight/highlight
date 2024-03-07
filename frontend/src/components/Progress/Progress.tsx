// eslint-disable-next-line no-restricted-imports
import { Progress as AntDesignProgress, ProgressProps } from 'antd'

type Props = Pick<ProgressProps, 'showInfo'> & {
	numerator: number
	denominator: number
}

const Progress = ({ denominator, numerator, ...props }: Props) => {
	return (
		<AntDesignProgress
			percent={Math.floor((numerator / denominator) * 100)}
			strokeColor="#5629c6"
			{...props}
		/>
	)
}

export const Progress_test = <Progress denominator={4} numerator={3} />

export default Progress
