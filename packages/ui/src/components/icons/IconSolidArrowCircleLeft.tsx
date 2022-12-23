import React from 'react'
import { IconProps } from './types'

export const IconSolidArrowCircleLeft = (props: IconProps) => {
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
				d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.707-10.293a1 1 0 0 0-1.414-1.414l-3 3a1 1 0 0 0 0 1.414l3 3a1 1 0 0 0 1.414-1.414L9.414 11H13a1 1 0 1 0 0-2H9.414l1.293-1.293Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
