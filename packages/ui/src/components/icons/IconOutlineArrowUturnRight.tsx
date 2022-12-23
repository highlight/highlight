import React from 'react'
import { IconProps } from './types'

export const IconOutlineArrowUturnRight = (props: IconProps) => {
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
				d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
			/>
		</svg>
	)
}
