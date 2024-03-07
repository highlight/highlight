import React from 'react'

import { IconProps } from './types'

export const IconOutlineSparkles = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 24 24"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M5 2a1 1 0 0 1 1 1v1h1a1 1 0 0 1 0 2H6v1a1 1 0 0 1-2 0V6H3a1 1 0 0 1 0-2h1V3a1 1 0 0 1 1-1Zm8 0a1 1 0 0 1 .949.684l2.135 6.404 5.267 1.976a1 1 0 0 1 0 1.872l-5.267 1.976-2.135 6.404a1 1 0 0 1-1.898 0l-2.135-6.404-5.267-1.976a1 1 0 0 1 0-1.872l5.267-1.976 2.135-6.404A1 1 0 0 1 13 2Zm0 4.162-1.337 4.011a1 1 0 0 1-.598.62L7.848 12l3.217 1.207a1 1 0 0 1 .598.62L13 17.837l1.337-4.01a1 1 0 0 1 .598-.62L18.152 12l-3.217-1.207a1 1 0 0 1-.598-.62L13 6.163ZM6 16a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2H7v1a1 1 0 1 1-2 0v-1H4a1 1 0 1 1 0-2h1v-1a1 1 0 0 1 1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
