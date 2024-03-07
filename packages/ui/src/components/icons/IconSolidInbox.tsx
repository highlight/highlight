import React from 'react'

import { IconProps } from './types'

export const IconSolidInbox = ({ size = '1em', ...props }: IconProps) => {
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
				d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm12 0H5v10h10V5Z"
				clipRule="evenodd"
			/>
			<path fill="currentColor" d="M4 12h3l1 2h4l1-2h3v4H4v-4Z" />
		</svg>
	)
}
