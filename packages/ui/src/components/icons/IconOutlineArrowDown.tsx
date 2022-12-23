import React from 'react'
import { IconProps } from './types'

export const IconOutlineArrowDown = (props: IconProps) => {
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
				d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
			/>
		</svg>
	)
}
