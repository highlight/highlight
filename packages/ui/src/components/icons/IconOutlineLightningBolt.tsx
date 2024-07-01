import React from 'react'

import { IconProps } from './types'

export const IconOutlineLightningBolt = ({
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
				d="M13.336 2.058A1 1 0 0 1 14 3v6h6a1 1 0 0 1 .774 1.633l-9 11A1 1 0 0 1 10 21v-6H4a1 1 0 0 1-.774-1.633l9-11a1 1 0 0 1 1.11-.309ZM6.11 13H11a1 1 0 0 1 1 1v4.199L17.89 11H13a1 1 0 0 1-1-1V5.801L6.11 13Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
