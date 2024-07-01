import React from 'react'

import { IconProps } from './types'

export const IconOutlineArrowRight = ({
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
				d="M13.293 4.293a1 1 0 0 1 1.414 0l7 7a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414-1.414L18.586 13H3a1 1 0 1 1 0-2h15.586l-5.293-5.293a1 1 0 0 1 0-1.414Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
