import React from 'react'
import { IconProps } from './types'

export const IconOutlineArrowSmallLeft = (props: IconProps) => {
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
				d="M19.5 12h-15m0 0 6.75 6.75M4.5 12l6.75-6.75"
			/>
		</svg>
	)
}
