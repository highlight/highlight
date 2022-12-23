import React from 'react'
import { IconProps } from './types'

export const IconOutlineArrowUturnLeft = (props: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 24 24"
			focusable="false"
			{...props}
		>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
			/>
		</svg>
	)
}
