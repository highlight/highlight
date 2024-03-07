import React from 'react'

import { IconProps } from './types'

export const IconOutlineHand = ({ size = '1em', ...props }: IconProps) => {
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
				d="M11.5 4a.5.5 0 0 0-.5.5V11a1 1 0 1 1-2 0V5.5a.5.5 0 0 0-1 0V14a1 1 0 1 1-2 0v-2.5a.5.5 0 0 0-1 0v2a6.5 6.5 0 1 0 13 0v-5a.5.5 0 0 0-1 0V11a1 1 0 1 1-2 0V5.5a.5.5 0 0 0-1 0V11a1 1 0 1 1-2 0V4.5a.5.5 0 0 0-.5-.5Zm2.112-.838A2.5 2.5 0 0 1 17 5.5v.55a2.5 2.5 0 0 1 3 2.45v5a8.5 8.5 0 0 1-17 0v-2a2.5 2.5 0 0 1 3-2.45V5.5a2.5 2.5 0 0 1 3.388-2.338 2.498 2.498 0 0 1 4.224 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
