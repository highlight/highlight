import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconOfficeBuilding: React.FC<Props> = ({
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
				fillRule="evenodd"
				clipRule="evenodd"
				d="M4 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1v-2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1H4a1 1 0 1 1 0-2V4Zm3 1h2v2H7V5Zm2 4H7v2h2V9Zm2-4h2v2h-2V5Zm2 4h-2v2h2V9Z"
				fill={color}
			/>
		</svg>
	)
}
