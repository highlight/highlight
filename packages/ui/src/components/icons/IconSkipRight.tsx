import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconSkipRight: React.FC<Props> = ({
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
				d="M15.8333 3C15.189 3 14.6667 3.52233 14.6667 4.16667V15.8333C14.6667 16.4777 15.189 17 15.8333 17C16.4777 17 17 16.4777 17 15.8333V4.16667C17 3.52233 16.4777 3 15.8333 3ZM12.482 8.47077C13.5437 9.2139 13.5437 10.7861 12.482 11.5292L5.93713 16.1107C4.69995 16.9767 3 16.0916 3 14.5814V5.41856C3 3.90839 4.69995 3.0233 5.93713 3.88933L12.482 8.47077Z"
				fill={color}
			/>
		</svg>
	)
}
