import React from 'react'

import { IconProps } from './types'

export const IconOutlinePrinter = ({ size = '1em', ...props }: IconProps) => {
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
				d="M6 5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3h1a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-1v1a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-1H5a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3h1V5Zm2 3h8V5a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3Zm-3 2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1v-1a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v1h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H5Zm11 5a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
