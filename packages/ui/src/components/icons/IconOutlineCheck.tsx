import React from 'react'
import { IconProps } from './types'

export const IconOutlineCheck = (props: IconProps) => {
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
				d="m4.5 12.75 6 6 9-13.5"
			/>
		</svg>
	)
}
