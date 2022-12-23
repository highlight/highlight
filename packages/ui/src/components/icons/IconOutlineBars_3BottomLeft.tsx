import React from 'react'
import { IconProps } from './types'

export const IconOutlineBars_3BottomLeft = (props: IconProps) => {
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
				d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
			/>
		</svg>
	)
}
