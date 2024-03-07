import React from 'react'

import { IconProps } from './types'

export const IconOutlineSwitchVertical = ({
	size = '1em',
	...props
}: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 24 24"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M6.293 3.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1-1.414 1.414L8 6.414V16a1 1 0 1 1-2 0V6.414L3.707 8.707a1 1 0 0 1-1.414-1.414l4-4ZM16 17.586V8a1 1 0 1 1 2 0v9.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L16 17.586Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
