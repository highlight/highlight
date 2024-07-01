import React from 'react'

import { IconProps } from './types'

export const IconOutlineMicrophone = ({
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
				d="M8 5a4 4 0 1 1 8 0v6a4 4 0 0 1-8 0V5Zm4-2a2 2 0 0 0-2 2v6a2 2 0 1 0 4 0V5a2 2 0 0 0-2-2Zm-7 7a1 1 0 0 1 1 1 6 6 0 0 0 12 0 1 1 0 1 1 2 0 8.001 8.001 0 0 1-7 7.938V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2.062A8.001 8.001 0 0 1 4 11a1 1 0 0 1 1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
