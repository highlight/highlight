import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	width?: number | string
	height?: number | string
	size?: number | string
	color?: string
}
export const IconMinusSm: React.FC<Props> = ({
	width,
	height,
	color,
	size,
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
			width={width ?? 20}
			height={height ?? 20}
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M5 10C5 9.44772 5.44772 9 6 9L14 9C14.5523 9 15 9.44772 15 10C15 10.5523 14.5523 11 14 11L6 11C5.44772 11 5 10.5523 5 10Z"
				fill={color}
			/>
		</svg>
	)
}
