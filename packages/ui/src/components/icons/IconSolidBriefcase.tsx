import React from 'react'

import { IconProps } from './types'

export const IconSolidBriefcase = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 20 20"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M6 6V5a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1h2a2 2 0 0 1 2 2v3.57A22.952 22.952 0 0 1 10 13a22.95 22.95 0 0 1-8-1.43V8a2 2 0 0 1 2-2h2Zm2-1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1H8V5Zm1 5a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
			<path
				fill="currentColor"
				d="M2 13.692V16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.308A24.974 24.974 0 0 1 10 15a24.98 24.98 0 0 1-8-1.308Z"
			/>
		</svg>
	)
}
