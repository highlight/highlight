import React from 'react'

import { IconProps } from './types'

export const IconSolidSaveAs = ({ size = '1em', ...props }: IconProps) => {
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
				d="M9.707 7.293a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l3-3a1 1 0 0 0-1.414-1.414L13 8.586V5h3a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3v3.586L9.707 7.293ZM11 3a1 1 0 1 1 2 0v2h-2V3Z"
			/>
			<path
				fill="currentColor"
				d="M4 9a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2H7a3 3 0 0 1-3-3V9Z"
			/>
		</svg>
	)
}
