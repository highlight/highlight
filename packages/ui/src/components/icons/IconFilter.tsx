import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconFilter: React.FC<Props> = ({ size, color, width, height }) => {
	if (size) {
		width = size
		height = size
	}
	width = width ?? 12
	height = height ?? 12
	color = color ?? 'currentColor'
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				xmlns="http://www.w3.org/2000/svg"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M2 4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V6.58579C22 7.11622 21.7893 7.62493 21.4142 8L15 14.4142L15 17C15 17.2652 14.8946 17.5196 14.7071 17.7071L10.7071 21.7071C10.4211 21.9931 9.99099 22.0787 9.61732 21.9239C9.24364 21.7691 9 21.4045 9 21V14.4142L2.58579 8C2.21071 7.62493 2 7.11622 2 6.58579V4ZM20 4H4V6.58579L10.4142 13C10.7893 13.3751 11 13.8838 11 14.4142V18.5858L13 16.5858V14.4142C13 13.8838 13.2107 13.3751 13.5858 13L20 6.58579V4Z"
				fill={color}
			/>
		</svg>
	)
}
