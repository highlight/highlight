import React from 'react'

import { IconProps } from './types'

export const IconOutlineEye = ({ size = '1em', ...props }: IconProps) => {
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
				d="M3.512 12a9.004 9.004 0 0 0 16.977 0 9.004 9.004 0 0 0-16.977 0Zm-2.008-.3C2.906 7.238 7.074 4 12 4c4.927 0 9.095 3.238 10.497 7.7a1 1 0 0 1 0 .6C21.095 16.762 16.927 20 12 20s-9.095-3.238-10.497-7.7a1 1 0 0 1 0-.6ZM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
