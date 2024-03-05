import React from 'react'

import { IconProps } from './types'

export const IconSolidEye = ({ size = '1em', ...props }: IconProps) => {
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
			<path fill="currentColor" d="M10 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
