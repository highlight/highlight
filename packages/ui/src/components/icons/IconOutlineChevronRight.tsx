import React from 'react'
import { IconProps } from './types'

export const IconOutlineChevronRight = (props: IconProps) => {
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
				d="m8.25 4.5 7.5 7.5-7.5 7.5"
			/>
		</svg>
	)
}
