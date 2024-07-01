import React from 'react'

import { IconProps } from './types'

export const IconOutlineChatAlt = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-4.586l-4.707 4.707A1 1 0 0 1 8 21v-4H5a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4a1 1 0 0 1 1 1v2.586l3.293-3.293A1 1 0 0 1 14 15h5a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H5Zm2 5a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2H8a1 1 0 0 1-1-1Zm4 0a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1Zm4 0a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H16a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
