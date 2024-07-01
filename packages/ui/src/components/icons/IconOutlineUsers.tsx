import React from 'react'

import { IconProps } from './types'

export const IconOutlineUsers = ({ size = '1em', ...props }: IconProps) => {
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
				d="M9 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm3-1a5 5 0 1 0 0 8 5 5 0 1 0 0-8Zm1.334 1.505C13.758 5.239 14 6.09 14 7s-.242 1.76-.666 2.495a3 3 0 1 0 0-4.99ZM9 15a5 5 0 0 0-5 5h10a5 5 0 0 0-5-5Zm7 5h4a5 5 0 0 0-6.001-4.9A6.977 6.977 0 0 1 16 20Zm-4-6.326A7 7 0 0 0 2 20v1a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-1a7 7 0 0 0-10-6.326Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
