import React from 'react'

import { IconProps } from './types'

export const IconOutlineAtSymbol = ({ size = '1em', ...props }: IconProps) => {
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
				d="M12 4a8 8 0 1 0 4 14.928 1 1 0 1 1 1 1.732A9.96 9.96 0 0 1 11.942 22C6.446 21.968 2 17.503 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10v1.5a3.5 3.5 0 0 1-6.396 1.966A5 5 0 1 1 17 12v1.5a1.5 1.5 0 0 0 3 0V12a8 8 0 0 0-8-8Zm3 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
