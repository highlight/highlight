import React from 'react'

import { IconProps } from './types'

export const IconOutlineBookmark = ({ size = '1em', ...props }: IconProps) => {
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
				d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v16a1 1 0 0 1-1.447.894L12 18.618l-6.553 3.276A1 1 0 0 1 4 21V5Zm3-1a1 1 0 0 0-1 1v14.382l5.553-2.776a1 1 0 0 1 .894 0L18 19.382V5a1 1 0 0 0-1-1H7Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
