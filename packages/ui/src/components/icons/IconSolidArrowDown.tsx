import React from 'react'

import { IconProps } from './types'

export const IconSolidArrowDown = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 20 20"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M16.707 10.293a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414 0l-6-6a1 1 0 1 1 1.414-1.414L9 14.586V3a1 1 0 0 1 2 0v11.586l4.293-4.293a1 1 0 0 1 1.414 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
