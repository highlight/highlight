import React from 'react'

import { IconProps } from './types'

export const IconSolidCalculator = ({ size = '1em', ...props }: IconProps) => {
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
				d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6Zm1 2a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H7Zm6 7a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Zm-3 3a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H10Zm-4 1a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm1-4a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H7Zm2 1a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1Zm4-4a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H13ZM9 9a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1ZM7 8a1 1 0 0 0 0 2h.01a1 1 0 0 0 0-2H7Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
