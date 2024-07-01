import React from 'react'

import { IconProps } from './types'

export const IconOutlineFolderOpen = ({
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
				d="M5 6a1 1 0 0 0-1 1v10a1 1 0 1 0 2 0v-5a3 3 0 0 1 3-3h7a1 1 0 0 0-1-1h-4.414l-2-2H5Zm4 5a1 1 0 0 0-1 1v5c0 .35-.06.687-.17 1H19a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H9Zm-4 9a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4.414l2 2H15a3 3 0 0 1 3 3h1a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H5Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
