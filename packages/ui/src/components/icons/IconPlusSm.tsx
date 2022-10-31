import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	width?: number
	height?: number
	color?: string
}

export const PlusSmIcon: React.FC<Props> = ({ width, height, color }) => {
	width = width ?? 20
	height = height ?? 20
	color = color ?? 'currentColor'
	return (
		<svg
			width={width ?? 20}
			height={height ?? 20}
			viewBox={`0 0 ${width} ${height}`}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M10 5C10.5523 5 11 5.44772 11 6V9L14 9C14.5523 9 15 9.44772 15 10C15 10.5523 14.5523 11 14 11H11V14C11 14.5523 10.5523 15 10 15C9.44771 15 9 14.5523 9 14V11H6C5.44772 11 5 10.5523 5 10C5 9.44771 5.44772 9 6 9L9 9V6C9 5.44772 9.44771 5 10 5Z"
				fill={color}
			/>
		</svg>
	)
}
