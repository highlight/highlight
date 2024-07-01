import React from 'react'

import { IconProps } from './types'

export const IconSolidUserAdd = ({ size = '1em', ...props }: IconProps) => {
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
				d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2a6 6 0 0 1 6 6H2a6 6 0 0 1 6-6Zm8-4a1 1 0 1 0-2 0v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1V7Z"
			/>
		</svg>
	)
}
