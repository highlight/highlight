import React from 'react'
import { IconProps } from './types'

export const IconOutlineStopCircle = (props: IconProps) => {
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
				d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874a.563.563 0 0 1-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z"
			/>
		</svg>
	)
}
