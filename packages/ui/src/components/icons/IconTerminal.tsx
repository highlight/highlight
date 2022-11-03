import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconTerminal: React.FC<Props> = ({
	size,
	color,
	width,
	height,
}) => {
	if (size) {
		width = size
		height = size
	}
	width = width ?? 20
	height = height ?? 20
	color = color ?? 'currentColor'
	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 20 20`}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M2 5C2 3.89543 2.89543 3 4 3H16C17.1046 3 18 3.89543 18 5V15C18 16.1046 17.1046 17 16 17H4C2.89543 17 2 16.1046 2 15V5ZM5.29289 6.29289C5.68342 5.90237 6.31658 5.90237 6.70711 6.29289L9.70711 9.29289C10.0976 9.68342 10.0976 10.3166 9.70711 10.7071L6.70711 13.7071C6.31658 14.0976 5.68342 14.0976 5.29289 13.7071C4.90237 13.3166 4.90237 12.6834 5.29289 12.2929L7.58579 10L5.29289 7.70711C4.90237 7.31658 4.90237 6.68342 5.29289 6.29289ZM11 12C10.4477 12 10 12.4477 10 13C10 13.5523 10.4477 14 11 14H14C14.5523 14 15 13.5523 15 13C15 12.4477 14.5523 12 14 12H11Z"
				fill={color}
			/>
		</svg>
	)
}
