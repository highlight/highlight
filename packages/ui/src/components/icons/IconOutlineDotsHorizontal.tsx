import React from 'react'

import { IconProps } from './types'

export const IconOutlineDotsHorizontal = ({
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
				d="M3 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm7 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm7 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
