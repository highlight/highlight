import React from 'react'
import { IconProps } from './types'

export const IconSolidLogout = (props: IconProps) => {
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
				fillRule="evenodd"
				d="M3 3a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm7.707 3.293a1 1 0 0 1 0 1.414L9.414 9H17a1 1 0 1 1 0 2H9.414l1.293 1.293a1 1 0 0 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414l3-3a1 1 0 0 1 1.414 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
