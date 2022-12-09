import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconDocumentDuplicate: React.FC<Props> = ({
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
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M7.1999 1.59961C6.31625 1.59961 5.5999 2.31595 5.5999 3.19961V9.59961C5.5999 10.4833 6.31625 11.1996 7.1999 11.1996H11.9999C12.8836 11.1996 13.5999 10.4833 13.5999 9.59961V5.13098C13.5999 4.70663 13.4313 4.29967 13.1313 3.99961L11.1999 2.06824C10.8998 1.76818 10.4929 1.59961 10.0685 1.59961H7.1999Z"
				fill={color}
			/>
			<path
				d="M2.3999 6.39961C2.3999 5.51595 3.11625 4.79961 3.9999 4.79961V10.3996C3.9999 11.7251 5.07442 12.7996 6.3999 12.7996H10.3999C10.3999 13.6833 9.68356 14.3996 8.7999 14.3996H3.9999C3.11625 14.3996 2.3999 13.6833 2.3999 12.7996V6.39961Z"
				fill={color}
			/>
		</svg>
	)
}
