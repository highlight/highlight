import React from 'react'

import { IconProps } from './types'

export const IconOutlineClipboardCopy = ({
	size = '1em',
	...props
}: IconProps) => {
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
				d="M7.17 4A3.001 3.001 0 0 1 10 2h2c1.306 0 2.418.835 2.83 2H16a3 3 0 0 1 3 3v3a1 1 0 1 1-2 0V7a1 1 0 0 0-1-1h-1.17A3.001 3.001 0 0 1 12 8h-2a3.001 3.001 0 0 1-2.83-2H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1.17ZM10 4a1 1 0 0 0 0 2h2a1 1 0 1 0 0-2h-2Zm3.707 6.293a1 1 0 0 1 0 1.414L12.414 13H20a1 1 0 1 1 0 2h-7.586l1.293 1.293a1 1 0 0 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414l3-3a1 1 0 0 1 1.414 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
