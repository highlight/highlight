// eslint-disable-next-line no-restricted-imports
import { Progress as AntDesignProgress, ProgressProps } from 'antd'
import React from 'react'

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

export default Progress
