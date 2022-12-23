import React from 'react'
import { IconProps } from './types'

export const IconOutlineArrowDownLeft = (props: IconProps) => {
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
				d="m19.5 4.5-15 15m0 0h11.25m-11.25 0V8.25"
			/>
		</svg>
	)
}
