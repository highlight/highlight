import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconArrowSmUp: React.FC<Props> = ({
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
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				xmlns="http://www.w3.org/2000/svg"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289L9.29289 4.29289C9.68342 3.90237 10.3166 3.90237 10.7071 4.29289L14.7071 8.29289C15.0976 8.68342 15.0976 9.31658 14.7071 9.70711C14.3166 10.0976 13.6834 10.0976 13.2929 9.70711L11 7.41421L11 15C11 15.5523 10.5523 16 10 16C9.44772 16 9 15.5523 9 15L9 7.41421L6.70711 9.70711C6.31658 10.0976 5.68342 10.0976 5.29289 9.70711Z"
				fill={color}
			/>
		</svg>
	)
}
