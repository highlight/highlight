import React from 'react'

import { IconProps } from './types'

export const IconOutlineAdjustments = ({
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
				d="M6 3a1 1 0 0 1 1 1v9.17a3.001 3.001 0 0 1 0 5.66V20a1 1 0 1 1-2 0v-1.17a3.001 3.001 0 0 1 0-5.66V4a1 1 0 0 1 1-1Zm6 0a1 1 0 0 1 1 1v1.17a3.001 3.001 0 0 1 0 5.66V20a1 1 0 1 1-2 0v-9.17a3.001 3.001 0 0 1 0-5.66V4a1 1 0 0 1 1-1Zm6 0a1 1 0 0 1 1 1v9.17a3.001 3.001 0 0 1 0 5.66V20a1 1 0 1 1-2 0v-1.17a3.001 3.001 0 0 1 0-5.66V4a1 1 0 0 1 1-1Zm-6 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-6 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
