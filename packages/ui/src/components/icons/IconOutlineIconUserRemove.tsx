import React from 'react'

import { IconProps } from './types'

export const IconOutlineIconUserRemove = ({
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
				d="M9 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM4 7a5 5 0 1 1 10 0A5 5 0 0 1 4 7Zm10 5a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1Zm-5 3a5 5 0 0 0-5 5h10a5 5 0 0 0-5-5Zm-7 5a7 7 0 1 1 14 0v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
