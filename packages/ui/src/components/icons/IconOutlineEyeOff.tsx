import React from 'react'

import { IconProps } from './types'

export const IconOutlineEyeOff = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2.293 2.293a1 1 0 0 1 1.414 0l3.04 3.04A10.955 10.955 0 0 1 12 4c4.927 0 9.095 3.238 10.497 7.7a1 1 0 0 1 0 .6 11.014 11.014 0 0 1-3.552 5.231l2.762 2.762a1 1 0 0 1-1.414 1.414l-18-18a1 1 0 0 1 0-1.414Zm5.943 4.53 1.732 1.731a4 4 0 0 1 5.478 5.478l2.076 2.076A9.022 9.022 0 0 0 20.489 12 9.004 9.004 0 0 0 8.236 6.822Zm5.696 5.695a2 2 0 0 0-2.45-2.45l2.45 2.45ZM4.625 8.174a1 1 0 0 1 .194 1.4A8.975 8.975 0 0 0 3.512 12a9.004 9.004 0 0 0 10.177 5.842 1 1 0 0 1 .372 1.965c-.668.127-1.357.193-2.06.193-4.927 0-9.095-3.238-10.497-7.7a1 1 0 0 1 0-.6 10.97 10.97 0 0 1 1.72-3.332 1 1 0 0 1 1.4-.194Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
