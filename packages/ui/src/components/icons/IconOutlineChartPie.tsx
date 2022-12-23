import React from 'react'
import { IconProps } from './types'

export const IconOutlineChartPie = (props: IconProps) => {
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
				d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
			/>
		</svg>
	)
}
