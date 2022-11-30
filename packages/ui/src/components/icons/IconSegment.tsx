import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconSegment: React.FC<Props> = ({
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
			viewBox={`0 0 20 20`}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M9.27005 2.16381C9.73956 1.9454 10.2604 1.9454 10.7299 2.16381L17.6148 5.36661C18.1284 5.60554 18.1284 6.47487 17.6148 6.7138L10.7299 9.9166C10.2604 10.135 9.73956 10.135 9.27005 9.9166L2.3852 6.7138C1.8716 6.47488 1.8716 5.60554 2.3852 5.36661L9.27005 2.16381Z"
				fill={color}
			/>
			<path
				d="M3.52659 8.8693L2.3852 9.40027C1.8716 9.63919 1.8716 10.5085 2.3852 10.7475L9.27005 13.9503C9.73956 14.1687 10.2604 14.1687 10.7299 13.9503L17.6148 10.7475C18.1284 10.5085 18.1284 9.63919 17.6148 9.40027L16.4734 8.8693L10.7299 11.5411C10.2604 11.7595 9.73956 11.7595 9.27005 11.5411L3.52659 8.8693Z"
				fill={color}
			/>
			<path
				d="M2.3852 13.2862L3.52659 12.7552L9.27005 15.4271C9.73956 15.6455 10.2604 15.6455 10.7299 15.4271L16.4734 12.7552L17.6148 13.2862C18.1284 13.5251 18.1284 14.3945 17.6148 14.6334L10.73 17.8362C10.2604 18.0546 9.73956 18.0546 9.27005 17.8362L2.3852 14.6334C1.8716 14.3945 1.8716 13.5251 2.3852 13.2862Z"
				fill={color}
			/>
		</svg>
	)
}
