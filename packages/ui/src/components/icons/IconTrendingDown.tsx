import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
}

export const IconTrendingDown: React.FC<Props> = ({ size = 14, color }) => {
	color = color ?? 'currentColor'

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className="h-5 w-5"
			viewBox="0 0 20 20"
			fill={color}
			width={size}
			height={size}
		>
			<path
				fillRule="evenodd"
				d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
