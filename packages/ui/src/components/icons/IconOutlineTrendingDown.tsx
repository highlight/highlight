import React from 'react'

import { IconProps } from './types'

export const IconOutlineTrendingDown = ({
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
				d="M2.293 6.293a1 1 0 0 1 1.414 0L9 11.586l3.293-3.293a1 1 0 0 1 1.414 0L20 14.586V9a1 1 0 1 1 2 0v8a1 1 0 0 1-1 1h-8a1 1 0 1 1 0-2h5.586L13 10.414l-3.293 3.293a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 0-1.414Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
