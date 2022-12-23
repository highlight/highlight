import React from 'react'
import { IconProps } from './types'

export const IconSolidMoon = (props: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 20 20"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.002 8.002 0 1 0 10.586 10.586Z"
			/>
		</svg>
	)
}
