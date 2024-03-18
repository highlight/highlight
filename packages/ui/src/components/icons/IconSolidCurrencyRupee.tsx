import React from 'react'

import { IconProps } from './types'

export const IconSolidCurrencyRupee = ({
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
				d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM7 5a1 1 0 1 0 0 2h1a2 2 0 0 1 1.732 1H7a1 1 0 1 0 0 2h2.732A2 2 0 0 1 8 11H7a1 1 0 0 0-.707 1.707l3 3a1 1 0 0 0 1.414-1.414l-1.483-1.484A4.008 4.008 0 0 0 11.874 10H13a1 1 0 1 0 0-2h-1.126a3.976 3.976 0 0 0-.41-1H13a1 1 0 1 0 0-2H7Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
