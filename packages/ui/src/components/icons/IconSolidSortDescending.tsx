import React from 'react'

import { IconProps } from './types'

export const IconSolidSortDescending = ({
	size = '1em',
	...props
}: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 20 20"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				d="M3 3a1 1 0 0 0 0 2h11a1 1 0 1 0 0-2H3Zm0 4a1 1 0 0 0 0 2h7a1 1 0 1 0 0-2H3Zm0 4a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H3Zm12-3a1 1 0 1 0-2 0v5.586l-1.293-1.293a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l3-3a1 1 0 0 0-1.414-1.414L15 13.586V8Z"
			/>
		</svg>
	)
}
