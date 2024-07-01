import React from 'react'

import { IconProps } from './types'

export const IconOutlineUser = ({ size = '1em', ...props }: IconProps) => {
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
				d="M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM7 7a5 5 0 1 1 10 0A5 5 0 0 1 7 7Zm-.917 13h11.834a6.002 6.002 0 0 0-11.834 0ZM4 21a8 8 0 1 1 16 0 1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
