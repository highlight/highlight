import React from 'react'

import { IconProps } from './types'

export const IconOutlineServer = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v4c0 .768-.289 1.47-.764 2 .475.53.764 1.232.764 2v4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-4c0-.768.289-1.47.764-2A2.989 2.989 0 0 1 2 10V6Zm3 7a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H5Zm14-2a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14Zm-3-3a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H17a1 1 0 0 1-1-1Zm0 8a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H17a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
