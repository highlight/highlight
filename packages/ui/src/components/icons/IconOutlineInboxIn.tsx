import React from 'react'

import { IconProps } from './types'

export const IconOutlineInboxIn = ({ size = '1em', ...props }: IconProps) => {
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
				d="M12 2a1 1 0 0 1 1 1v5.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 1.414-1.414L11 8.586V3a1 1 0 0 1 1-1ZM6 5a1 1 0 0 0-1 1v6h1.586A2 2 0 0 1 8 12.586L10.414 15h3.172L16 12.586A2 2 0 0 1 17.414 12H19V6a1 1 0 0 0-1-1h-2a1 1 0 1 1 0-2h2a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h2a1 1 0 0 1 0 2H6Zm-1 9v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4h-1.586L15 16.414a2 2 0 0 1-1.414.586h-3.172A2 2 0 0 1 9 16.414L6.586 14H5Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
