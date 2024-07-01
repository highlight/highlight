import React from 'react'

import { IconProps } from './types'

export const IconSolidColorSwatch = ({ size = '1em', ...props }: IconProps) => {
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
				d="M4 2a2 2 0 0 0-2 2v11a3 3 0 1 0 6 0V4a2 2 0 0 0-2-2H4Zm1 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
				clipRule="evenodd"
			/>
			<path
				fill="currentColor"
				d="m10 14.243 4.9-4.9a2 2 0 0 0 0-2.828L13.485 5.1a2 2 0 0 0-2.828 0L10 5.757v8.486ZM16 18H9.071l6-6H16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2Z"
			/>
		</svg>
	)
}
