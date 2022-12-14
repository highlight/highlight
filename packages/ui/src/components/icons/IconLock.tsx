import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	width?: number | string
	height?: number | string
	size?: number | string
	color?: string
}
export const IconLockClosed: React.FC<Props> = ({
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
			width={width}
			height={height}
			viewBox="0 0 12 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M2.9998 5.39922V4.19922C2.9998 2.54236 4.34295 1.19922 5.9998 1.19922C7.65666 1.19922 8.9998 2.54236 8.9998 4.19922V5.39922C9.66255 5.39922 10.1998 5.93648 10.1998 6.59922V9.59922C10.1998 10.262 9.66255 10.7992 8.9998 10.7992H2.9998C2.33706 10.7992 1.7998 10.262 1.7998 9.59922V6.59922C1.7998 5.93648 2.33706 5.39922 2.9998 5.39922ZM7.7998 4.19922V5.39922H4.1998V4.19922C4.1998 3.20511 5.00569 2.39922 5.9998 2.39922C6.99392 2.39922 7.7998 3.20511 7.7998 4.19922Z"
				fill={color}
			/>
		</svg>
	)
}

export const IconLockOpened: React.FC<Props> = ({
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
			width={width}
			height={height}
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M10 2C7.23858 2 5 4.23858 5 7V9C3.89543 9 3 9.89543 3 11V16C3 17.1046 3.89543 18 5 18H15C16.1046 18 17 17.1046 17 16V11C17 9.89543 16.1046 9 15 9H7V7C7 5.34315 8.34315 4 10 4C11.3965 4 12.5725 4.95512 12.9055 6.24926C13.0432 6.78411 13.5884 7.1061 14.1232 6.96844C14.6581 6.83078 14.9801 6.28559 14.8424 5.75074C14.2874 3.59442 12.3312 2 10 2Z"
				fill={color}
			/>
		</svg>
	)
}
