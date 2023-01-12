import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconMenuAlt3: React.FC<Props> = ({
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
			viewBox="0 0 14 14"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M2.1001 3.50078C2.1001 3.11418 2.4135 2.80078 2.8001 2.80078H11.2001C11.5867 2.80078 11.9001 3.11418 11.9001 3.50078C11.9001 3.88738 11.5867 4.20078 11.2001 4.20078H2.8001C2.4135 4.20078 2.1001 3.88738 2.1001 3.50078Z"
				fill={color}
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M2.1001 7.00078C2.1001 6.61418 2.4135 6.30078 2.8001 6.30078H11.2001C11.5867 6.30078 11.9001 6.61418 11.9001 7.00078C11.9001 7.38738 11.5867 7.70078 11.2001 7.70078H2.8001C2.4135 7.70078 2.1001 7.38738 2.1001 7.00078Z"
				fill={color}
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M6.3001 10.5008C6.3001 10.1142 6.6135 9.80078 7.0001 9.80078H11.2001C11.5867 9.80078 11.9001 10.1142 11.9001 10.5008C11.9001 10.8874 11.5867 11.2008 11.2001 11.2008H7.0001C6.6135 11.2008 6.3001 10.8874 6.3001 10.5008Z"
				fill={color}
			/>
		</svg>
	)
}
