import React from 'react'

import { IconProps } from './types'

export const IconOutlineRewind = ({ size = '1em', ...props }: IconProps) => {
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
				d="M8.8 6.4C10.118 5.411 12 6.352 12 8v2l4.8-3.6C18.119 5.411 20 6.352 20 8v8c0 1.648-1.881 2.589-3.2 1.6L12 14v2c0 1.648-1.882 2.589-3.2 1.6l-5.333-4a2 2 0 0 1 0-3.2l5.333-4ZM10 8l-5.333 4L10 16V8Zm8 0-5.333 4L18 16V8Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
