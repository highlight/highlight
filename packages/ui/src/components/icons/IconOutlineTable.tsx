import React from 'react'

import { IconProps } from './types'

export const IconOutlineTable = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2 8a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8Zm3-1a1 1 0 0 0-1 1v1h16V8a1 1 0 0 0-1-1H5Zm15 4h-7v2h7v-2Zm0 4h-7v2h6a1 1 0 0 0 1-1v-1Zm-9 2v-2H4v1a1 1 0 0 0 1 1h6Zm-7-4h7v-2H4v2Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
