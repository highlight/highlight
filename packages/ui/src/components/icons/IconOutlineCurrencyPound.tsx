import React from 'react'

import { IconProps } from './types'

export const IconOutlineCurrencyPound = ({
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
				d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm8-3a3 3 0 1 1 6 0 1 1 0 1 1-2 0 1 1 0 1 0-2 0v2h1a1 1 0 1 1 0 2h-1v1c0 .35-.06.687-.17 1H15a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2 1 1 0 0 0 1-1v-1H9a1 1 0 1 1 0-2h1V9Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
