import React from 'react'

import { IconProps } from './types'

export const IconOutlineHashtag = ({ size = '1em', ...props }: IconProps) => {
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
				d="M11.242 3.03a1 1 0 0 1 .728 1.213L11.03 8h3.94l1.06-4.243a1 1 0 1 1 1.94.486L17.03 8H20a1 1 0 1 1 0 2h-3.47l-1 4H18a1 1 0 1 1 0 2h-2.97l-1.06 4.242a1 1 0 1 1-1.94-.485L12.97 16H9.03l-1.06 4.242a1 1 0 1 1-1.94-.485L6.97 16H4a1 1 0 1 1 0-2h3.47l1-4H6a1 1 0 0 1 0-2h2.97l1.06-4.243a1 1 0 0 1 1.213-.727ZM10.531 10l-1 4h3.938l1-4h-3.938Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
