import React from 'react'
import { IconProps } from './types'

export const IconOutlineChevronUp = (props: IconProps) => {
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
				d="m4.5 15.75 7.5-7.5 7.5 7.5"
			/>
		</svg>
	)
}
