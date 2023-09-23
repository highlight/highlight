import React from 'react'
import { IconProps } from './types'

export const IconOutlineX = ({
	size = '1em',
	strokeWidth = '4',
	...props
}: IconProps) => {
	return (
		<svg
			fill="none"
			width={size}
			height={size}
			focusable="false"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				fill="currentColor"
				strokeWidth={strokeWidth.toString()}
				d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 1 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414Z"
			/>
		</svg>
	)
}
