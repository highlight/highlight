import React from 'react'

import { IconProps } from './types'

export const IconOutlineTicket = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2 7a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v3a1 1 0 0 1-1 1 1 1 0 1 0 0 2 1 1 0 0 1 1 1v3a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-3a1 1 0 0 1 1-1 1 1 0 1 0 0-2 1 1 0 0 1-1-1V7Zm14 11v-1a1 1 0 1 0-2 0v1H5a1 1 0 0 1-1-1v-2.17a3.001 3.001 0 0 0 0-5.66V7a1 1 0 0 1 1-1h9v1a1 1 0 1 0 2 0V6h3a1 1 0 0 1 1 1v2.17a3.001 3.001 0 0 0 0 5.66V17a1 1 0 0 1-1 1h-3Zm-1-8a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
