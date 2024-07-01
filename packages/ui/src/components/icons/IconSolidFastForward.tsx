import React from 'react'

import { IconProps } from './types'

export const IconSolidFastForward = ({ size = '1em', ...props }: IconProps) => {
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
				d="M4.555 5.168A1 1 0 0 0 3 6v8a1 1 0 0 0 1.555.832L10 11.202V14a1 1 0 0 0 1.555.832l6-4a1 1 0 0 0 0-1.664l-6-4A1 1 0 0 0 10 6v2.798l-5.445-3.63Z"
			/>
		</svg>
	)
}
