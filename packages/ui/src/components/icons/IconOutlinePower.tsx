import React from 'react'
import { IconProps } from './types'

export const IconOutlinePower = (props: IconProps) => {
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
				d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9"
			/>
		</svg>
	)
}
