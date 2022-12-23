import React from 'react'
import { IconProps } from './types'

export const IconOutlineArrowUpLeft = (props: IconProps) => {
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
				d="m19.5 19.5-15-15m0 0v11.25m0-11.25h11.25"
			/>
		</svg>
	)
}
