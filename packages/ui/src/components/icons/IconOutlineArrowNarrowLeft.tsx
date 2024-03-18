import React from 'react'

import { IconProps } from './types'

export const IconOutlineArrowNarrowLeft = ({
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
				d="M7.707 7.293a1 1 0 0 1 0 1.414L5.414 11H21a1 1 0 1 1 0 2H5.414l2.293 2.293a1 1 0 1 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
