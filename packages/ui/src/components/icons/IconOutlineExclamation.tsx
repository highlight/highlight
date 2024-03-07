import React from 'react'

import { IconProps } from './types'

export const IconOutlineExclamation = ({
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
				d="M9.402 3.5c1.155-2 4.041-2 5.196 0l6.928 12c1.155 2-.288 4.5-2.598 4.5H5.072c-2.31 0-3.753-2.5-2.598-4.5l6.928-12Zm3.464 1a1 1 0 0 0-1.732 0l-6.928 12a1 1 0 0 0 .866 1.5h13.856a1 1 0 0 0 .866-1.5l-6.928-12ZM12 8a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1Zm-1 7a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
