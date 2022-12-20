import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
}

export const IconTrendingUp: React.FC<Props> = ({ size = 14, color }) => {
	color = color ?? 'currentColor'

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className="h-5 w-5"
			viewBox="0 0 20 20"
			fill={color}
			height={size}
			width={size}
		>
			<path
				fillRule="evenodd"
				d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
