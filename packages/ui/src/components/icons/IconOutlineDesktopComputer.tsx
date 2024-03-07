import React from 'react'

import { IconProps } from './types'

export const IconOutlineDesktopComputer = ({
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
				d="M2 5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-3.47l.373 1.489.804.804A1 1 0 0 1 16 22H8a1 1 0 0 1-.707-1.707l.804-.804L8.469 18H5a3 3 0 0 1-3-3V5Zm2 9v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1H4Zm16-2H4V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7Zm-6.53 6h-2.94l-.5 2h3.94l-.5-2Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
