import React from 'react'
import { IconProps } from './types'

export const IconOutlineArrowLongUp = (props: IconProps) => {
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
				d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18"
			/>
		</svg>
	)
}
