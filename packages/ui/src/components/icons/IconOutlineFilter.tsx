import React from 'react'

import { IconProps } from './types'

export const IconOutlineFilter = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2 4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2.586A2 2 0 0 1 21.414 8L15 14.414V17a1 1 0 0 1-.293.707l-4 4A1 1 0 0 1 9 21v-6.586L2.586 8A2 2 0 0 1 2 6.586V4Zm18 0H4v2.586L10.414 13A2 2 0 0 1 11 14.414v4.172l2-2v-2.172A2 2 0 0 1 13.586 13L20 6.586V4Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
