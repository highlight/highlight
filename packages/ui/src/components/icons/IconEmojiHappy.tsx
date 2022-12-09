import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
	width?: number | string
	height?: number | string
}

export const IconEmojiHappy: React.FC<Props> = ({
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
				fillRule="evenodd"
				clipRule="evenodd"
				d="M6.0002 10.7992C8.65116 10.7992 10.8002 8.65019 10.8002 5.99922C10.8002 3.34825 8.65116 1.19922 6.0002 1.19922C3.34923 1.19922 1.2002 3.34825 1.2002 5.99922C1.2002 8.65019 3.34923 10.7992 6.0002 10.7992ZM4.2002 5.39922C4.53157 5.39922 4.8002 5.13059 4.8002 4.79922C4.8002 4.46785 4.53157 4.19922 4.2002 4.19922C3.86882 4.19922 3.6002 4.46785 3.6002 4.79922C3.6002 5.13059 3.86882 5.39922 4.2002 5.39922ZM8.4002 4.79922C8.4002 5.13059 8.13157 5.39922 7.8002 5.39922C7.46882 5.39922 7.2002 5.13059 7.2002 4.79922C7.2002 4.46785 7.46882 4.19922 7.8002 4.19922C8.13157 4.19922 8.4002 4.46785 8.4002 4.79922ZM8.12152 8.12048C8.35583 7.88617 8.35583 7.50627 8.12152 7.27196C7.8872 7.03764 7.5073 7.03764 7.27299 7.27196C6.57004 7.9749 5.43035 7.9749 4.7274 7.27196C4.49309 7.03764 4.11319 7.03764 3.87888 7.27196C3.64456 7.50627 3.64456 7.88617 3.87888 8.12048C5.05045 9.29206 6.94994 9.29206 8.12152 8.12048Z"
				fill={color}
			/>
		</svg>
	)
}
