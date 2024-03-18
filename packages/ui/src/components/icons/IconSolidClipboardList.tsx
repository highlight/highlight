import React from 'react'

import { IconProps } from './types'

export const IconSolidClipboardList = ({
	size = '1em',
	...props
}: IconProps) => {
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
				d="M9 2a1 1 0 0 0 0 2h2a1 1 0 1 0 0-2H9Z"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M4 5a2 2 0 0 1 2-2 3 3 0 0 0 3 3h2a3 3 0 0 0 3-3 2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm3 4a1 1 0 0 0 0 2h.01a1 1 0 1 0 0-2H7Zm3 0a1 1 0 0 0 0 2h3a1 1 0 1 0 0-2h-3Zm-3 4a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H7Zm3 0a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2h-3Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
