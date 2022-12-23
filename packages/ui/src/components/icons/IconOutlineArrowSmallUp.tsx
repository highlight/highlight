import React from 'react'
import { IconProps } from './types'

export const IconOutlineArrowSmallUp = (props: IconProps) => {
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
				d="M12 19.5v-15m0 0-6.75 6.75M12 4.5l6.75 6.75"
			/>
		</svg>
	)
}
