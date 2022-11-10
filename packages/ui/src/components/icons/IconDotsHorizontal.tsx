import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconDotsHorizontal: React.FC<Props> = ({
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
				d="M6 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM12 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM16 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
				fill={color}
			/>
		</svg>
	)
}
