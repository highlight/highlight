import React from 'react'

import { IconProps } from './types'

export const IconOutlineReply = ({ size = '1em', ...props }: IconProps) => {
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
				d="M9.707 3.293a1 1 0 0 1 0 1.414L5.414 9H13a9 9 0 0 1 9 9v2a1 1 0 1 1-2 0v-2a7 7 0 0 0-7-7H5.414l4.293 4.293a1 1 0 0 1-1.414 1.414l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
