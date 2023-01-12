import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconExternalLink: React.FC<Props> = ({
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
				d="M6.5998 1.80078C6.26843 1.80078 5.9998 2.06941 5.9998 2.40078C5.9998 2.73215 6.26843 3.00078 6.5998 3.00078H8.15128L4.37554 6.77652C4.14123 7.01083 4.14123 7.39073 4.37554 7.62504C4.60985 7.85936 4.98975 7.85936 5.22407 7.62504L8.9998 3.84931V5.40078C8.9998 5.73215 9.26843 6.00078 9.5998 6.00078C9.93118 6.00078 10.1998 5.73215 10.1998 5.40078V2.40078C10.1998 2.06941 9.93118 1.80078 9.5998 1.80078H6.5998Z"
				fill={color}
			/>
			<path
				d="M2.9998 3.00078C2.33706 3.00078 1.7998 3.53804 1.7998 4.20078V9.00078C1.7998 9.66352 2.33706 10.2008 2.9998 10.2008H7.7998C8.46255 10.2008 8.9998 9.66352 8.9998 9.00078V7.20078C8.9998 6.86941 8.73118 6.60078 8.3998 6.60078C8.06843 6.60078 7.7998 6.86941 7.7998 7.20078V9.00078H2.9998V4.20078L4.7998 4.20078C5.13118 4.20078 5.3998 3.93215 5.3998 3.60078C5.3998 3.26941 5.13118 3.00078 4.7998 3.00078H2.9998Z"
				fill={color}
			/>
		</svg>
	)
}
