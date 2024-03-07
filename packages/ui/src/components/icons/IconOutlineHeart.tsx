import React from 'react'

import { IconProps } from './types'

export const IconOutlineHeart = ({ size = '1em', ...props }: IconProps) => {
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
				d="m14.025 7.025-1.318 1.318a1 1 0 0 1-1.414 0L9.975 7.025a3.5 3.5 0 1 0-4.95 4.95L12 18.95l6.975-6.975.707.707-.707-.707a3.5 3.5 0 0 0-4.95-4.95Zm-1.414-1.414a5.5 5.5 0 0 1 7.778 7.778l-7.682 7.682a1 1 0 0 1-1.414 0L3.61 13.39a5.5 5.5 0 0 1 7.778-7.778l.611.61.61-.61Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
