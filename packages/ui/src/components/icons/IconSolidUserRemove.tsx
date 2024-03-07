import React from 'react'

import { IconProps } from './types'

export const IconSolidUserRemove = ({ size = '1em', ...props }: IconProps) => {
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
				d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 11a6 6 0 0 0-12 0h12Zm-1-9a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-4Z"
			/>
		</svg>
	)
}
