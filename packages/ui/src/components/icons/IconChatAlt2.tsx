import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconChatAlt2: React.FC<Props> = ({
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
				d="M1.3999 3.49961C1.3999 2.72641 2.0267 2.09961 2.7999 2.09961H7.6999C8.4731 2.09961 9.0999 2.72641 9.0999 3.49961V6.29961C9.0999 7.07281 8.4731 7.69961 7.6999 7.69961H6.2999L4.1999 9.79961V7.69961H2.7999C2.0267 7.69961 1.3999 7.07281 1.3999 6.29961V3.49961Z"
				fill={color}
			/>
			<path
				d="M10.4999 4.89961V5.47951C10.4999 7.47883 8.87913 9.09961 6.8798 9.09961V9.09961L5.64311 10.3363C5.83898 10.4405 6.06254 10.4996 6.2999 10.4996H7.6999L9.7999 12.5996V10.4996H11.1999C11.9731 10.4996 12.5999 9.87281 12.5999 9.09961V6.29961C12.5999 5.52641 11.9731 4.89961 11.1999 4.89961H10.4999Z"
				fill={color}
			/>
		</svg>
	)
}
