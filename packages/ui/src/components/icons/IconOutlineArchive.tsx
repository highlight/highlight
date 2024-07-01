import React from 'react'

import { IconProps } from './types'

export const IconOutlineArchive = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2 6a3 3 0 0 1 3-3h14a3 3 0 0 1 1 5.83V18a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8.83A3.001 3.001 0 0 1 2 6Zm4 3v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9H6ZM5 5a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2H5Zm4 7a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
