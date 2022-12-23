import React from 'react'
import { IconProps } from './types'

export const IconOutlinePause = (props: IconProps) => {
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
				d="M15.75 5.25v13.5m-7.5-13.5v13.5"
			/>
		</svg>
	)
}
