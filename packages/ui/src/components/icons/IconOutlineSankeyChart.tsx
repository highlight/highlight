import React from 'react'
import { IconProps } from './types'

export const IconOutlineSankeyChart = (props: IconProps) => {
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
				strokeWidth={2}
				d="M4 12c11 0 5 6 16 6M4 18C15 18 9 6 20 6M4 6c11 0 5 6 16 6"
			/>
		</svg>
	)
}
