import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconTemplate: React.FC<Props> = ({
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
			viewBox="0 0 12 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M1.7998 2.40078C1.7998 2.06941 2.06843 1.80078 2.3998 1.80078H9.5998C9.93117 1.80078 10.1998 2.06941 10.1998 2.40078V3.60078C10.1998 3.93215 9.93117 4.20078 9.5998 4.20078H2.3998C2.06843 4.20078 1.7998 3.93215 1.7998 3.60078V2.40078Z"
				fill={color}
			/>
			<path
				d="M1.7998 6.00078C1.7998 5.66941 2.06843 5.40078 2.3998 5.40078H5.9998C6.33118 5.40078 6.5998 5.66941 6.5998 6.00078V9.60078C6.5998 9.93215 6.33118 10.2008 5.9998 10.2008H2.3998C2.06843 10.2008 1.7998 9.93215 1.7998 9.60078V6.00078Z"
				fill={color}
			/>
			<path
				d="M8.3998 5.40078C8.06843 5.40078 7.7998 5.66941 7.7998 6.00078V9.60078C7.7998 9.93215 8.06843 10.2008 8.3998 10.2008H9.5998C9.93117 10.2008 10.1998 9.93215 10.1998 9.60078V6.00078C10.1998 5.66941 9.93117 5.40078 9.5998 5.40078H8.3998Z"
				fill={color}
			/>
		</svg>
	)
}
