import React from 'react'

import { IconProps } from './types'

export const IconOutlineStatusOnline = ({
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
				d="M6.343 4.929a1 1 0 0 1 0 1.414 8 8 0 0 0 0 11.314A1 1 0 1 1 4.93 19.07c-3.905-3.905-3.905-10.237 0-14.142a1 1 0 0 1 1.414 0Zm11.314 0a1 1 0 0 1 1.414 0c3.905 3.905 3.905 10.237 0 14.142a1 1 0 0 1-1.414-1.414 8 8 0 0 0 0-11.314 1 1 0 0 1 0-1.414ZM9.172 7.757a1 1 0 0 1 0 1.415 4 4 0 0 0 0 5.656 1 1 0 1 1-1.415 1.415 6 6 0 0 1 0-8.486 1 1 0 0 1 1.415 0Zm5.656 0a1 1 0 0 1 1.415 0 6 6 0 0 1 0 8.486 1 1 0 1 1-1.415-1.415 4 4 0 0 0 0-5.656 1 1 0 0 1 0-1.415ZM10 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
