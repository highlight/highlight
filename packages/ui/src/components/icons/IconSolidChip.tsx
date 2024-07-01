import React from 'react'

import { IconProps } from './types'

export const IconSolidChip = ({ size = '1em', ...props }: IconProps) => {
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
			<path fill="currentColor" d="M13 7H7v6h6V7Z" />
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M7 2a1 1 0 0 1 2 0v1h2V2a1 1 0 1 1 2 0v1h2a2 2 0 0 1 2 2v2h1a1 1 0 1 1 0 2h-1v2h1a1 1 0 1 1 0 2h-1v2a2 2 0 0 1-2 2h-2v1a1 1 0 1 1-2 0v-1H9v1a1 1 0 1 1-2 0v-1H5a2 2 0 0 1-2-2v-2H2a1 1 0 1 1 0-2h1V9H2a1 1 0 0 1 0-2h1V5a2 2 0 0 1 2-2h2V2ZM5 5h10v10H5V5Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
