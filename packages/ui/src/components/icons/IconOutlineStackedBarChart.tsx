import React from 'react'

import { IconProps } from './types'

export const IconOutlineStackedBarChart = ({
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
				d="M17 2a3 3 0 0 0-3 3v1.17c-.313-.11-.65-.17-1-.17h-2a3 3 0 0 0-3 3v1.17c-.313-.11-.65-.17-1-.17H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h2c.768 0 1.47-.289 2-.764.53.475 1.232.764 2 .764h2c.768 0 1.47-.289 2-.764.53.475 1.232.764 2 .764h2a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3h-2Zm-7 17v-5h4v5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1Zm4-7h-4V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3Zm-7 0a1 1 0 0 1 1 1v2H4v-2a1 1 0 0 1 1-1h2Zm-3 7v-2h4v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm12 0a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-9h-4v9Zm0-11V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h-4Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
