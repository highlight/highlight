import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
}

export const IconZigZag: React.FC<Props> = ({
	color = 'currentColor',
	size = 14,
}) => {
	return (
		<svg
			fill="none"
			width={size}
			height={size}
			viewBox="0 0 14 8"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M1.5 6.5L5.07574 2.92426C5.31005 2.68995 5.68995 2.68995 5.92426 2.92426L8.07574 5.07574C8.31005 5.31005 8.68995 5.31005 8.92426 5.07574L12.5 1.5"
				stroke={color}
				strokeWidth="1.6"
				strokeLinecap="round"
			/>
		</svg>
	)
}
