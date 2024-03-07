import React from 'react'

import { IconProps } from './types'

export const IconOutlineShare = ({ size = '1em', ...props }: IconProps) => {
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
				d="M18 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-4 2a4 4 0 1 1 .983 2.626l-5.071 2.536a4.012 4.012 0 0 1 0 1.676l5.071 2.536a4 4 0 1 1-.895 1.788l-5.071-2.536a4 4 0 1 1 0-5.253l5.071-2.535A4.015 4.015 0 0 1 14 6Zm-8 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 6a2 2 0 1 0-.001 4A2 2 0 0 0 18 16Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
