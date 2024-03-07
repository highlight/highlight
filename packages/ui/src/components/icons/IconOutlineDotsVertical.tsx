import React from 'react'

import { IconProps } from './types'

export const IconOutlineDotsVertical = ({
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
				d="M12 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 7a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 7a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
