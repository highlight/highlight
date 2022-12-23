import React from 'react'
import { IconProps } from './types'

export const IconOutlineArrowLongLeft = (props: IconProps) => {
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
				d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18"
			/>
		</svg>
	)
}
