import React from 'react'

import { IconProps } from './types'

export const IconSolidCreditCard = ({ size = '1em', ...props }: IconProps) => {
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
				d="M4 4a2 2 0 0 0-2 2v1h16V6a2 2 0 0 0-2-2H4Z"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M18 9H2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9ZM4 13a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm5-1a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2H9Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
