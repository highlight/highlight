import React from 'react'

import { IconProps } from './types'

export const IconOutlineCurrencyBangladeshi = ({
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
				d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm6-5a1 1 0 0 1 1-1 3 3 0 0 1 3 3v1h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 0 2 0v-1a1 1 0 1 1 2 0v1a3 3 0 1 1-6 0v-3H9a1 1 0 1 1 0-2h1V9a1 1 0 0 0-1-1 1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
