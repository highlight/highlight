import React from 'react'

import { IconProps } from './types'

export const IconOutlineSearchCircle = ({
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
				d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-4 2a4 4 0 1 1 1.968 3.446l-2.26 2.261a1 1 0 0 1-1.415-1.414l2.261-2.261A3.984 3.984 0 0 1 9 11Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
