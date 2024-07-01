import React from 'react'

import { IconProps } from './types'

export const IconSolidFolderOpen = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2 6a2 2 0 0 1 2-2h4l2 2h4a2 2 0 0 1 2 2v1H8a3 3 0 0 0-3 3v1.5a1.5 1.5 0 0 1-3 0V6Z"
				clipRule="evenodd"
			/>
			<path
				fill="currentColor"
				d="M6 12a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H2h2a2 2 0 0 0 2-2v-2Z"
			/>
		</svg>
	)
}
