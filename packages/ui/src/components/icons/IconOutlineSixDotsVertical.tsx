import React from 'react'

import { IconProps } from './types'

export const IconOutlineSixDotsVertical = ({
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
				d="M9 5a2 2 0 1 0-4 0 2 2 0 0 0 4 0Zm0 7a2 2 0 1 0-4 0 2 2 0 0 0 4 0Zm0 7a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM19 5a2 2 0 1 0-4 0 2 2 0 0 0 4 0Zm0 7a2 2 0 1 0-4 0 2 2 0 0 0 4 0Zm0 7a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
