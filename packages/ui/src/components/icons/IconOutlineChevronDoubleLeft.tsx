import React from 'react'
import { IconProps } from './types'

export const IconOutlineChevronDoubleLeft = (props: IconProps) => {
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
				d="m18.75 19.5-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
			/>
		</svg>
	)
}
