import React from 'react'

import { IconProps } from './types'

export const IconSolidDotsCircleHorizontal = ({
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
				fillRule="evenodd"
				d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM7 9H5v2h2V9Zm8 0h-2v2h2V9ZM9 9h2v2H9V9Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
